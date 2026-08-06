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
    EmbeddingDimensionMismatch,
    KnowledgeCard,
    close_connection,
    retrieve_knowledge_context,
    session_rag_chip_candidates_to_rpc,
    should_retrieve_knowledge,
    stack_context_blocks,
    suggest_chip_candidates,
    _COMPAT_CHIP_TEMPLATES,
    _expand_query,
    _format_block,
    _fts_match_query,
    _fuse_cards_by_rrf,
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
    self.assertLess(stacked.text.index("Proton"), stacked.text.index("Local knowledge"))
    self.assertTrue(stacked.proton_attached)
    self.assertTrue(stacked.knowledge_attached)

  def test_stack_context_skips_empty_blocks(self):
    stacked = stack_context_blocks(
      proton_text="",
      knowledge_text="--- Local knowledge base ---\ncard1",
      max_total_bytes=10_000,
    )
    self.assertTrue(stacked.text.startswith("--- Local knowledge base ---"))
    self.assertFalse(stacked.proton_attached)
    self.assertTrue(stacked.knowledge_attached)

  def test_stack_context_byte_budget(self):
    stacked = stack_context_blocks(
      proton_text="P" * 5000,
      knowledge_text="K" * 5000,
      max_total_bytes=6000,
    )
    self.assertLessEqual(len(stacked.text.encode("utf-8")), 6200)

  def test_stack_context_reports_a_starved_knowledge_block(self):
    """Proton logs take budget first, so the KB block can be truncated or dropped outright.

    Transparency is built from these flags, so a starved block must not be reportable as
    attached — that was the bug: kb_attached=True with sources cited for text the model
    never received.
    """
    stacked = stack_context_blocks(
      proton_text="P" * 5900,
      knowledge_text="--- Local knowledge base ---\n" + "K" * 5000,
      max_total_bytes=6000,
    )
    self.assertTrue(stacked.proton_attached)
    self.assertFalse(stacked.knowledge_attached)

  def test_stack_context_drops_knowledge_entirely_when_no_budget_remains(self):
    stacked = stack_context_blocks(
      proton_text="P" * 6000,
      knowledge_text="--- Local knowledge base ---\ncard1",
      max_total_bytes=6000,
    )
    self.assertTrue(stacked.proton_attached)
    self.assertFalse(stacked.knowledge_attached)
    self.assertNotIn("Local knowledge", stacked.text)

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

  @staticmethod
  def _card(section_id: int, name: str) -> KnowledgeCard:
    return KnowledgeCard(
      section_id, 2, "Game", "boss", name, f"card {name}", "", "", None, None, "fallback_no_source"
    )

  def test_rrf_promotes_a_card_the_vectors_favour(self):
    """A weak keyword hit that the vectors love climbs, without simply taking over.

    Rewritten from test_rerank_cards_by_vector_orders_by_similarity (R5), which asserted the
    cosine-only sort this replaces. Fusion is consensus, not override: D is 4th on keywords
    and 1st on vectors, so it lands 2nd overall rather than 1st.
    """
    cards = [self._card(i, n) for i, n in enumerate("ABCDE", start=1)]
    # Query [1, 0]; dot product orders the vector list D > A > B > C > E.
    vectors = {4: [1.0, 0.0], 1: [0.9, 0.0], 2: [0.8, 0.0], 3: [0.7, 0.0], 5: [0.6, 0.0]}
    fused = _fuse_cards_by_rrf(cards, [1.0, 0.0], vectors, top_k=5)
    self.assertEqual([c.name for c in fused], ["A", "D", "B", "C", "E"])

  def test_rrf_keeps_top_keyword_hit_when_its_vector_is_missing(self):
    """Direct regression on the cosine-only reranker, and on naive RRF.

    The old code appended vectorless cards after every vector-scored card, so the #1 keyword
    hit lost to a marginal cosine match purely for lacking a vector. Textbook RRF rebuilds
    that same exile by omission — a card absent from the vector list scores 0 from it, and on
    a 30-card shortlist even the worst vectored card then outranks the best keyword hit.
    Backfilling the missing rank is what keeps A on top here.
    """
    cards = [self._card(i, n) for i, n in enumerate("ABCDE", start=1)]
    # A is the best keyword hit and the only card whose vector never got baked.
    vectors = {2: [0.5, 0.0], 3: [0.6, 0.0], 4: [0.7, 0.0], 5: [0.8, 0.0]}
    fused = _fuse_cards_by_rrf(cards, [1.0, 0.0], vectors, top_k=5)
    self.assertEqual(fused[0].name, "A")

  def test_fts_query_drops_function_words(self):
    self.assertEqual(
      _fts_match_query("How do I beat King Dodongo"),
      '"beat" OR "King" OR "Dodongo"',
    )

  def test_fts_query_is_empty_when_only_function_words(self):
    """No match beats a junk match.

    Every one of these terms appears in nearly every card, so an OR over them used to return
    eight seed cards scoring 1.9-5.2 — above several genuine compat hits. Returning "" sends
    the caller to the genre/compat fallback instead.
    """
    self.assertEqual(_fts_match_query("the a of and to it is"), "")
    self.assertEqual(_fts_match_query("how do i"), "")

  def test_fts_query_keeps_weak_but_meaningful_words(self):
    """The stopword list is function words only, and stays that way.

    "best" reads like filler in "the best thing to do", and like the whole question in "best
    build for this boss". A term wrongly added to the list fails invisibly — it just quietly
    stops matching — so the list is not grown to catch marginal queries. The relevance floor
    and the vector half of fusion handle those.
    """
    self.assertEqual(
      _fts_match_query("what is the best thing to do here"),
      '"best" OR "thing" OR "here"',
    )

  def test_expand_query_drops_app_name_once_the_game_is_resolved(self):
    # Already scoped by game_id, so the title is pure BM25 noise that favours cards
    # repeating it.
    self.assertEqual(
      _expand_query("How do I beat King Dodongo", "Ocarina of Time", game_resolved=True),
      "How do I beat King Dodongo",
    )

  def test_expand_query_prepends_app_name_when_the_game_is_unresolved(self):
    # Prepended, not appended: past the token cap it was silently discarded.
    self.assertEqual(
      _expand_query("How do I beat King Dodongo", "Ocarina of Time", game_resolved=False),
      "Ocarina of Time How do I beat King Dodongo",
    )

  def _tiered_card(self, section_id: int, name: str, tier: str, body: str = "body") -> KnowledgeCard:
    return KnowledgeCard(
      section_id, 2, "Game", "boss", name, body, "https://example.test/x", "CC BY-SA", None, None, tier
    )

  def test_block_trust_tier_is_the_lowest_present(self):
    """A block states one tier for everything in it, so it must be the weakest claim.

    Was cards[0].trust_tier, so one wiki_verified card at the front labelled two
    fallback_no_source cards behind it as verified.
    """
    cards = [
      self._tiered_card(1, "A", "wiki_verified"),
      self._tiered_card(2, "B", "fallback_no_source"),
      self._tiered_card(3, "C", "wiki_no_patch"),
    ]
    _text, trust, _sources = _format_block(
      cards, fallback_text=None, domain="strategy", max_bytes=10_000
    )
    self.assertEqual(trust, "fallback_no_source")

  def test_block_drops_whole_cards_and_keeps_the_end_sentinel(self):
    """Byte-slicing cut the last card mid-sentence and took the sentinel with it."""
    cards = [self._tiered_card(i, f"Card{i}", "wiki_verified", body="X" * 400) for i in range(1, 6)]
    text, _trust, sources = _format_block(
      cards, fallback_text=None, domain="strategy", max_bytes=1_200
    )
    self.assertTrue(text.endswith("--- End local knowledge base ---"))
    self.assertLessEqual(len(text.encode("utf-8")), 1_200)
    # Whole cards only: every card named in the block is present in full.
    for i in range(1, 6):
      if f"Card{i}" in text:
        self.assertIn("X" * 400, text)
    # Sources describe surviving cards only.
    self.assertLess(len(sources), len(cards))
    self.assertEqual(len(sources), text.count("[Game / boss:"))
    self.assertIn("omitted to fit budget", text)

  def test_block_returns_nothing_when_not_even_one_card_fits(self):
    cards = [self._tiered_card(1, "Huge", "wiki_verified", body="X" * 5_000)]
    text, _trust, sources = _format_block(
      cards, fallback_text=None, domain="strategy", max_bytes=200
    )
    self.assertEqual(text, "")
    self.assertEqual(sources, [])

  def test_v2_corpus_refuses_hybrid_and_says_why(self):
    """A pre-v3 corpus baked bare documents; querying it with a prefixed vector is garbage.

    Nothing in the file distinguishes the two — same model, same dimension — so the manifest's
    embedding_variant is the only signal, and its absence has to fail closed.
    """
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    v2_manifest = {"version": "1", "embedding_model": "nomic-embed-text"}  # no embedding_variant
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service._load_corpus_manifest",
      return_value=v2_manifest,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_section_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      side_effect=AssertionError("must not embed against an incompatible corpus"),
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

  def test_mismatched_embedding_model_refuses_hybrid(self):
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    other_model = {
      "version": "1",
      "embedding_variant": "nomic-prefixed-v1",
      "embedding_model": "bge-m3",
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service._load_corpus_manifest",
      return_value=other_model,
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
    self.assertEqual(result.retrieval_method, "keyword_embed_unavailable")

  def test_query_embedding_carries_the_search_query_prefix(self):
    """Runtime must prefix queries the same way the builder prefixed documents."""
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
    ) as embed:
      retrieve_knowledge_context(
        settings,
        ask_mode="strategy",
        question="Glyphid Dreadnought weak point",
        app_id="2321470",
        app_name="Deep Rock Galactic: Survivor",
        domain="strategy",
        pc_ip="127.0.0.1:11434",
      )
    sent = embed.call_args[0][1]
    self.assertEqual(len(sent), 1)
    self.assertTrue(sent[0].startswith("search_query: "))

  def test_relevance_floor_leaves_a_junk_compat_ask_unattached(self):
    """Off-topic Asks used to attach a card anyway, and the prompt cites what it attaches.

    Compat has no genre fallback, so the floor is visible end to end here: every candidate is
    below it, _compat_fallback finds nothing either, and the block is not built.
    """
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=False,
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="speed",
        question="how do i cook pasta for dinner tonight",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertFalse(result.attached)
    self.assertEqual(result.text_block, "")

  def test_followup_header_swamps_the_query_it_is_prepended_to(self):
    """Why game_ai_request retrieves on question_for_retrieval, not question_for_model.

    The header is byte-for-byte identical on every follow-up, and it is long. Prepended to the
    question and passed through the token cap, it displaces the user's own words — so every
    follow-up Ask in the product searched the same boilerplate. This pins the mechanism; that
    the two call sites now pass lane.text is covered on device (testing.md KB rows).
    """
    from backend.services.ollama_prompts import build_reply_followup_context_block

    question = "what about the second phase"
    header = build_reply_followup_context_block("shorter", "How do I beat King Dodongo?", "Roll.")

    polluted = _fts_match_query(f"{header}\n{question}")
    clean = _fts_match_query(question)

    self.assertIn("REPLY", polluted)
    self.assertNotIn("phase", polluted)  # the actual question never reaches the index
    self.assertEqual(clean, '"about" OR "second" OR "phase"')

  def test_rrf_without_any_vectors_preserves_keyword_order(self):
    cards = [self._card(i, n) for i, n in enumerate("ABCDE", start=1)]
    fused = _fuse_cards_by_rrf(cards, [1.0, 0.0], {}, top_k=5)
    self.assertEqual([c.name for c in fused], ["A", "B", "C", "D", "E"])

  def test_rrf_dimension_mismatch_raises_rather_than_truncating(self):
    cards = [
      KnowledgeCard(1, 2, "Game", "boss", "A", "c", "", "", None, None, "fallback_no_source"),
    ]
    with self.assertRaises(EmbeddingDimensionMismatch):
      _fuse_cards_by_rrf(cards, [1.0, 0.0, 0.0], {1: [1.0, 0.0]}, top_k=1)

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
      # Expert mode (top_k=5), not speed (top_k=1), on purpose. Under the cosine-only
      # reranker a single mocked vector took the top slot outright, because vectorless cards
      # were exiled behind every scored one — so a top_k=1 assertion was really asserting
      # that exile. Fusion instead lets the vector-favoured tip climb from keyword rank 6
      # into the shortlist while the two strongest keyword hits keep their places, which is
      # the behaviour worth pinning.
      result = retrieve_knowledge_context(
        settings,
        ask_mode="expert",
        question="why is my game crashing proton issue",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "hybrid")
    self.assertIn("Proton", result.text_block)
    topics = [line for line in result.text_block.splitlines() if line.startswith("[Tip:")]
    self.assertEqual(len(topics), 5)
    # Strongest keyword hits survive fusion rather than being displaced by the vectors.
    self.assertTrue(topics[0].startswith("[Tip: crash]"))

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

  def test_kill_switch_leaves_keyword_search_working_and_says_so(self):
    """Hybrid off is a diagnosis aid, not a way to turn the knowledge base off.

    ``embed_texts`` is patched to explode: if the switch were only advisory the call would
    happen anyway and the test would error rather than fail on the assertion.
    """
    settings = {
      "use_local_knowledge_base": True,
      "rag_corpus_path": str(SEED_DB.parent),
      "rag_hybrid_retrieval_enabled": False,
    }
    with mock.patch(
      "backend.services.knowledge_base_service.nomic_embed_available",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.corpus_has_usable_compat_vectors",
      return_value=True,
    ), mock.patch(
      "backend.services.knowledge_base_service.embed_texts",
      side_effect=AssertionError("query must not be embedded while hybrid is off"),
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="expert",
        question="why is my game crashing proton issue",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertTrue(result.attached)
    self.assertEqual(result.retrieval_method, "keyword_hybrid_disabled")

  def test_hybrid_stays_on_when_the_setting_was_never_saved(self):
    """An older settings.json has no such key. Missing must read as on, not off."""
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
      return_value={1: [1.0, 0.0] + [0.0] * 766},
    ):
      result = retrieve_knowledge_context(
        settings,
        ask_mode="expert",
        question="why is my game crashing proton issue",
        app_id="",
        app_name="",
        domain="compat",
        pc_ip="127.0.0.1:11434",
      )
    self.assertEqual(result.retrieval_method, "hybrid")

  def test_vector_pack_unpack_roundtrip(self):
    vec = [0.1, -0.2, 0.3]
    blob = pack_embedding_vector(vec)
    unpacked = unpack_embedding_vector(blob)
    for a, b in zip(vec, unpacked):
      self.assertAlmostEqual(a, b, places=5)


if __name__ == "__main__":
  unittest.main()
