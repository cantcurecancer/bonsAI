import os
import subprocess
import sys
import unittest
from pathlib import Path

from backend.services.knowledge_base_service import (
    close_connection,
    retrieve_knowledge_context,
    should_retrieve_knowledge,
    stack_context_blocks,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
SEED_DB = REPO_ROOT / "dist" / "knowledge-base-test" / "corpus.db"


def _ensure_seed_db() -> None:
    if SEED_DB.is_file():
        return
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
      app_id="1245620",
      app_name="ELDEN RING",
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

  def test_stack_context_byte_budget(self):
    stacked = stack_context_blocks(
      proton_text="P" * 5000,
      knowledge_text="K" * 5000,
      max_total_bytes=6000,
    )
    self.assertLessEqual(len(stacked.encode("utf-8")), 6200)


if __name__ == "__main__":
  unittest.main()
