import unittest

from backend.services.ollama_prompts import (
    build_reply_followup_context_block,
    sanitize_reply_followup,
)


class ReplyFollowupTests(unittest.TestCase):
    def test_sanitize_requires_parent_turn(self):
        self.assertIsNone(sanitize_reply_followup(None))
        self.assertIsNone(sanitize_reply_followup({"chip_id": "too_long"}))
        self.assertIsNone(
            sanitize_reply_followup(
                {"chip_id": "nope", "parent_question": "q", "parent_answer": "a"}
            )
        )

    def test_sanitize_normalizes(self):
        out = sanitize_reply_followup(
            {
                "chip_id": "too_short",
                "parent_question": " How? ",
                "parent_answer": " Short ",
                "preferred_model": "qwen2.5vl:3b",
            }
        )
        self.assertEqual(out["chip_id"], "too_short")
        self.assertEqual(out["parent_question"], "How?")
        self.assertEqual(out["preferred_model"], "qwen2.5vl:3b")

    def test_context_block_includes_parent_turn(self):
        block = build_reply_followup_context_block("too_long", "Why lag?", "Because CPU.")
        self.assertIn("Too long", block)
        self.assertIn("Why lag?", block)
        self.assertIn("Because CPU.", block)

    def test_sanitize_accepts_unfenced_spoiler_chip(self):
        out = sanitize_reply_followup(
            {
                "chip_id": "unfenced_spoiler",
                "parent_question": "How do I beat the boss?",
                "parent_answer": "Just rush in.",
            }
        )
        self.assertIsNotNone(out)
        self.assertEqual(out["chip_id"], "unfenced_spoiler")

    def test_context_block_labels_unfenced_spoiler(self):
        block = build_reply_followup_context_block(
            "unfenced_spoiler", "How do I beat the boss?", "Just rush in."
        )
        self.assertIn("Unfenced spoiler", block)


if __name__ == "__main__":
    unittest.main()
