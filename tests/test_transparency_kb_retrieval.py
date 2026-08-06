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

    def test_hybrid_disabled_reads_differently_from_embed_unavailable(self):
        """Decision 5: a chosen setting must not read as a broken install.

        Someone who flipped the Developer toggle should not go looking for a missing Ollama
        model, so these two strings stay distinct.
        """
        disabled = kb_retrieval_detail_label("keyword_hybrid_disabled")
        unavailable = kb_retrieval_detail_label("keyword_embed_unavailable")
        self.assertEqual(disabled, "Keyword search (hybrid disabled)")
        self.assertNotEqual(disabled, unavailable)
        # The compact chip stays generic for every keyword variant.
        self.assertEqual(kb_retrieval_chip_label("keyword_hybrid_disabled"), "Keyword search")

    def test_compat_transparency_source_bullet(self):
        snapshot = {
            **build_knowledge_base_transparency(
                attached=True,
                trust_tier="fallback_no_source",
                sources=[],
                notes="compat_tips",
                timing_ms={},
                retrieval_method="hybrid",
                kb_domain="compat",
            ),
            "proton_log_excerpt_attached": False,
            "proton_log_sources": [],
            "proton_log_notes": "",
        }
        manifest = build_context_chips_manifest(snapshot=snapshot)
        kb_chip = next(c for c in manifest["context_chips"] if c["id"] == "kb")
        self.assertIn("Source: shared troubleshooting tips", kb_chip["body"]["bullets"])

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

    def test_ollama_route_snapshot_propagates_kb_domain_for_compat_bullet(self):
        from backend.services.transparency_service import build_ollama_route_snapshot

        snapshot = build_ollama_route_snapshot(
            raw_question="proton crash",
            sanitizer_action="allow",
            sanitizer_reason_codes=[],
            text_after_sanitizer="proton crash",
            ollama_result={
                "model": "gemma4:e2b",
                "success": True,
                "response": "ok",
                **build_knowledge_base_transparency(
                    attached=True,
                    trust_tier="fallback_no_source",
                    sources=[],
                    notes="compat_tips",
                    timing_ms={"embed_ms": 10.0},
                    retrieval_method="hybrid",
                    kb_domain="compat",
                ),
            },
            base_response_text="ok",
            response_text="ok",
            applied=None,
            app_id="550",
            app_name="Left 4 Dead 2",
            pc_ip="127.0.0.1:11434",
            err_tail="",
            elapsed_seconds=1.0,
        )
        self.assertEqual(snapshot.get("kb_domain"), "compat")
        kb_chip = next(c for c in snapshot["context_chips"] if c["id"] == "kb")
        self.assertIn("Source: shared troubleshooting tips", kb_chip["body"]["bullets"])


if __name__ == "__main__":
    unittest.main()
