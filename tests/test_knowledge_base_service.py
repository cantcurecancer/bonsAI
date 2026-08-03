import os
import subprocess
import sys
import unittest
from pathlib import Path
from unittest import mock

from backend.services.knowledge_base_schema import (
    pack_embedding_vector,
    unpack_embedding_vector,
)
from backend.services.knowledge_base_service import (
    KnowledgeCard,
    close_connection,
    retrieve_knowledge_context,
    session_rag_chip_candidates_to_rpc,
    should_retrieve_knowledge,
    stack_context_blocks,
    suggest_chip_candidates,
    _COMPAT_CHIP_TEMPLATES,
    _rerank_cards_by_vector,
)
from backend.services.ollama_embed_service import OllamaEmbedError

REPO_ROOT = Path(__file__).resolve().parents[1]
SEED_DB = REPO_ROOT / "dist" / "knowledge-base-test" / "corpus.db"


def _ensure_seed_db() -> None:
    SEED_DB.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "build_rag_db.py"), "--seed", "--out", str(SEED_DB.parent)],
        check=True,
        cwd=str(REPO_ROOT),
    )


class KnowledgeBaseServiceTests(unittest.TestCase):
  @classmethod
  def setUpClass(cls):
    _ensure_seed_db()
    if not SEED_DB.is_file():
      raise unittest.SkipTest("seed corpus build failed")

  def setUp(self):
    if not SEED_DB.is_file():
      self.skipTest("seed corpus missing")

  def tearDown(self):
    close_connection(str(SEED_DB))

  def test_should_retrieve_strategy_when_enabled(self):
    ok, domain = should_retrieve_knowledge(
      use_local_knowledge_base=True,
      ask_mode="strategy",
      question="How do I beat King Dodongo?",
      app_id="413150",
      app_name="The Legend of Zelda: Ocarina of Time",
    )
    self.assertTrue(ok)
    self.assertEqual(domain, "strategy")

  def test_should_retrieve_compat_on_troubleshooting(self):
    ok, domain = should_retrieve_knowledge(
      use_local_knowledge_base=True,
      ask_mode="speed",
      question="why is my game crashing proton issue",
      app_id="",
      app_name="",
    )
    self.assertTrue(ok)
    self.assertEqual(domain, "compat")

  def test_should_retrieve_compat_on_deck_sleep_proton(self):
    ok, domain = should_retrieve_knowledge(
      use_local_knowledge_base=True,
      ask_mode="speed",
      question="deck sleep resume proton black screen",
      app_id="",
      app_name="",
    )
    self.assertTrue(ok)
    self.assertEqual(domain, "compat")

  def test_should_not_retrieve_when_disabled(self):
    ok, domain = should_retrieve_knowledge(
      use_local_knowledge_base=False,
      ask_mode="strategy",
      question="boss help",
      app_id="413150",
      app_name="Zelda",
    )
    self.assertFalse(ok)
    self.assertEqual(domain, "")

  def test_soh_alias_resolves_to_oot_cards(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = retrieve_knowledge_context(
      settings,
      ask_mode="strategy",
      question="King Dodongo boss weak point",
      app_id="",
      app_name="",
      shortcut_name="Ship of Harkinian",
      domain="strategy",
    )
    self.assertTrue(result.attached)
    self.assertIn("King Dodongo", result.text_block)
    self.assertIn("alias:ship of harkinian", result.notes)

  def test_missing_corpus_graceful(self):
    result = retrieve_knowledge_context(
      {"rag_corpus_path": "/nonexistent/path"},
      ask_mode="strategy",
      question="help",
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
      domain="strategy",
    )
    self.assertFalse(result.attached)
    self.assertEqual(result.unavailable_reason, "corpus_missing")

  def test_stack_context_proton_first(self):
    stacked = stack_context_blocks(
      proton_text="--- Proton logs ---\nline1",
      knowledge_text="--- Local knowledge base ---\ncard1",
      max_total_bytes=10_000,
    )
    self.assertLess(stacked.index("Proton"), stacked.index("Local knowledge"))

  def test_stack_context_skips_empty_blocks(self):
    stacked = stack_context_blocks(
      proton_text="",
      knowledge_text="--- Local knowledge base ---\ncard1",
      max_total_bytes=10_000,
    )
    self.assertTrue(stacked.startswith("--- Local knowledge base ---"))

  def test_stack_context_byte_budget(self):
    stacked = stack_context_blocks(
      proton_text="P" * 5000,
      knowledge_text="K" * 5000,
      max_total_bytes=6000,
    )
    self.assertLessEqual(len(stacked.encode("utf-8")), 6200)

  def test_suggest_chip_candidates_kb_off(self):
    settings = {
      "use_local_knowledge_base": False,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
    )
    self.assertFalse(result.ok)
    self.assertEqual(result.reason, "kb_off")
    self.assertEqual(result.candidates, [])

  def test_suggest_chip_candidates_missing_corpus(self):
    result = suggest_chip_candidates(
      {"use_local_knowledge_base": True, "rag_corpus_path": "/nonexistent/path"},
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
    )
    self.assertFalse(result.ok)
    self.assertEqual(result.reason, "corpus_missing")

  def test_suggest_chip_candidates_appid_hit(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
    )
    self.assertTrue(result.ok)
    texts = [c.text for c in result.candidates]
    self.assertTrue(any("Dreadnought" in t for t in texts))
    dreadnought = next(c for c in result.candidates if "Dreadnought" in c.text)
    self.assertEqual(dreadnought.category, "strategy")
    self.assertEqual(dreadnought.prefer_ask_mode, "strategy")
    self.assertTrue(any("Proton" in t for t in texts))

  def test_suggest_chip_candidates_exact_pool_for_a_covered_game(self):
    """Pin the whole candidate list, so any pool regression fails rather than degrades quietly.

    Before this policy the same corpus produced 29 candidates, 25 of them the template
    "Any known TOPIC issues for this game?" built from raw corpus topic slugs (steam_machine,
    bpm, desktop_mode, gaming_mode, wine, windows_steam, steamvr). Asserting the exact list
    catches a reintroduced fallback, a lifted cap, a reordering, or a new template - a
    "no slugs present" assertion could not, since the offending code path is now gone.
    """
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
    )
    self.assertTrue(result.ok)
    self.assertEqual(
      [c.text for c in result.candidates],
      [
        "How do I beat Glyphid Dreadnought?",
        "Tips for Hollow Bough in this game?",
        "Any known Proton issues for this game?",
        "Any Steam Input issues for this game?",
      ],
    )
    self.assertEqual([c.domain for c in result.candidates], ["strategy", "strategy", "compat", "compat"])

  def test_suggest_chip_candidates_caps_generic_compat_chips(self):
    """Generic compat chips are bounded so they cannot crowd out entity-named ones."""
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="2321470",
      app_name="Deep Rock Galactic: Survivor",
    )
    compat = [c for c in result.candidates if c.domain == "compat"]
    strategy = [c for c in result.candidates if c.domain == "strategy"]
    self.assertLessEqual(len(compat), 2)
    self.assertTrue(strategy, "expected at least one entity-named candidate")
    # Entity-named candidates come first, because the composer walks the pool in order.
    self.assertEqual(result.candidates[: len(strategy)], strategy)

  def test_suggest_chip_candidates_uncovered_game_falls_back_to_static_seeds(self):
    """A game with no corpus sections returns ok False rather than generic-only chips."""
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="999999999",
      app_name="Some Game Not In The Corpus",
    )
    self.assertFalse(result.ok)
    self.assertIn(result.reason, ("app_unresolved", "no_sections"))
    self.assertEqual(result.candidates, [])

  def test_suggest_chip_candidates_every_chip_is_corpus_grounded_or_curated(self):
    """The stated rule: a returned chip either names a corpus entity or is a curated topic."""
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="413150",
      app_name="The Legend of Zelda: Ocarina of Time",
    )
    self.assertTrue(result.ok)
    curated = set(_COMPAT_CHIP_TEMPLATES.values())
    for candidate in result.candidates:
      if candidate.domain == "compat":
        self.assertIn(candidate.text, curated)
      else:
        self.assertEqual(candidate.domain, "strategy")
        self.assertEqual(candidate.prefer_ask_mode, "strategy")

  def test_suggest_chip_candidates_rpc_shape(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    result = suggest_chip_candidates(
      settings,
      app_id="413150",
      app_name="The Legend of Zelda: Ocarina of Time",
    )
    payload = session_rag_chip_candidates_to_rpc(result)
    self.assertTrue(payload["ok"])
    self.assertGreaterEqual(len(payload["candidates"]), 1)
    self.assertIn("text", payload["candidates"][0])
    self.assertIn("category", payload["candidates"][0])

  def test_rerank_cards_by_vector_orders_by_similarity(self):
    cards = [
      KnowledgeCard(1, 2, "Game", "boss", "Low", "card low", "", "", None, None, "fallback_no_source"),
      KnowledgeCard(2, 2, "Game", "boss", "High", "card high", "", "", None, None, "fallback_no_source"),
    ]
    vectors = {1: [0.0, 1.0], 2: [1.0, 0.0]}
    reranked = _rerank_cards_by_vector(cards, [1.0, 0.0], vectors, top_k=1)
    self.assertEqual(reranked[0].name, "High")

  def test_hybrid_retrieval_uses_keyword_when_nomic_missing(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=False,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_section_vectors",
      return_value=True,
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="strategy",
        question="Glyphid Dreadnought weak point",
        app_id="2321470",
        app_name="Deep Rock Galactic: Survivor",
        domain="strategy",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "keyword")

  def test_hybrid_retrieval_reranks_when_nomic_available(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_section_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      return_value=[[1.0, 0.0] + [0.0] * 766],
    ), mock.patch(
      "backend.services.knowledge_base_service._load_section_vectors",
      return_value={
        3: [1.0, 0.0] + [0.0] * 766,
        4: [0.0, 1.0] + [0.0] * 766,
      },
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="strategy",
        question="Glyphid Dreadnought weak point",
        app_id="2321470",
        app_name="Deep Rock Galactic: Survivor",
        domain="strategy",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "hybrid")
    self.assertIn("Dreadnought", result.text_block)

  def test_hybrid_embed_failure_falls_back_to_keyword_embed_unavailable(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_section_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      side_effect=OllamaEmbedError("timeout"),
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="strategy",
        question="Glyphid Dreadnought weak point",
        app_id="2321470",
        app_name="Deep Rock Galactic: Survivor",
        domain="strategy",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "keyword_embed_unavailable")

  def test_compat_hybrid_reranks_when_nomic_available(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_compat_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      return_value=[[1.0, 0.0] + [0.0] * 766],
    ), mock.patch(
      "backend.services.knowledge_base_service._load_compat_vectors",
      return_value={
        1: [1.0, 0.0] + [0.0] * 766,
        2: [0.0, 1.0] + [0.0] * 766,
      },
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="speed",
        question="why is my game crashing proton issue",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "hybrid")
    self.assertIn("Proton", result.text_block)

  def test_compat_keyword_when_nomic_missing(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=False,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_compat_vectors",
      return_value=True,
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="speed",
        question="proton shader cache deck",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "keyword")

  def test_compat_embed_failure_falls_back(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_compat_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      side_effect=OllamaEmbedError("timeout"),
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="speed",
        question="proton crash deck sleep",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "keyword_embed_unavailable")

  def test_vector_pack_unpack_roundtrip(self):
    vec = [0.1, -0.2, 0.3]
    blob = pack_embedding_vector(vec)
    unpacked = unpack_embedding_vector(blob)
    for a, b in zip(vec, unpacked):
      self.assertAlmostEqual(a, b, places=5)


if __name__ == "__main__":
  unittest.main()
