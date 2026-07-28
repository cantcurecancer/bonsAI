import unittest

from backend.services.transparency_service import (
    build_context_chips_manifest,
    build_knowledge_base_transparency,
    kb_retrieval_chip_label,
    kb_retrieval_detail_label,
)


class TransparencyKbRetrievalTests(unittest.TestCase):
    def test_kb_retrieval_labels(self):
        self.assertEqual(kb_retrieval_chip_label("hybrid"), "Keyword + meaning")
        self.assertEqual(kb_retrieval_chip_label("keyword"), "Keyword search")
        self.assertEqual(
            kb_retrieval_detail_label("keyword_embed_unavailable"),
            "Keyword search (embed unavailable)",
        )

    def test_kb_chip_uses_retrieval_label(self):
        snapshot = {
            **build_knowledge_base_transparency(
                attached=True,
                trust_tier="wiki_verified",
                sources=[],
                notes="app_id:2321470",
                timing_ms={"embed_ms": 12.5, "rerank_ms": 0.4},
                retrieval_method="hybrid",
            ),
            "proton_log_excerpt_attached": False,
            "proton_log_sources": [],
            "proton_log_notes": "",
        }
        manifest = build_context_chips_manifest(snapshot=snapshot)
        kb_chip = next(c for c in manifest["context_chips"] if c["id"] == "kb")
        self.assertEqual(kb_chip["label"], "Keyword + meaning")
        self.assertIn("Keyword + meaning", kb_chip["body"]["bullets"][0])


if __name__ == "__main__":
    unittest.main()
