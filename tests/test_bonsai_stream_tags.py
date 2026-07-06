"""Tests for ``<bonsai-status>`` stream tag extraction."""

import unittest

from backend.services.bonsai_stream_tags import (
    compose_thinking_blurb,
    deterministic_thinking_phase_fallback,
    extract_bonsai_status,
    extract_question_snippet,
    format_thinking_phase,
)


class BonsaiStreamTagsTests(unittest.TestCase):
    def test_extract_and_strip(self):
        raw = "<bonsai-status>Checking GPU</bonsai-status>\n\nHello there."
        summary, stripped = extract_bonsai_status(raw)
        self.assertEqual(summary, "Checking GPU")
        self.assertEqual(stripped, "Hello there.")

    def test_no_tag_passthrough(self):
        raw = "Plain answer."
        summary, stripped = extract_bonsai_status(raw)
        self.assertIsNone(summary)
        self.assertEqual(stripped, raw)

    def test_incomplete_tag_hidden_from_visible(self):
        raw = "<bonsai-status>Checking GPU"
        summary, stripped = extract_bonsai_status(raw)
        self.assertIsNone(summary)
        self.assertEqual(stripped, "")

    def test_deterministic_phase_fallback(self):
        self.assertIn(
            "masterpiece",
            deterministic_thinking_phase_fallback(streaming=True, has_partial=True, elapsed_seconds=0).lower(),
        )
        self.assertIn(
            "still thinking",
            deterministic_thinking_phase_fallback(streaming=False, has_partial=False, elapsed_seconds=10).lower(),
        )
        self.assertIn(
            "hard",
            deterministic_thinking_phase_fallback(streaming=False, has_partial=False, elapsed_seconds=3).lower(),
        )
        self.assertIn(
            "brain",
            deterministic_thinking_phase_fallback(streaming=False, has_partial=False, elapsed_seconds=0).lower(),
        )

    def test_format_thinking_phase_starting(self):
        self.assertEqual(format_thinking_phase("starting"), "Starting…")

    def test_format_thinking_phase_with_game(self):
        self.assertEqual(
            format_thinking_phase("proton_logs", app_name="Elden Ring"),
            "Reading Proton logs for Elden Ring…",
        )
        self.assertEqual(
            format_thinking_phase("building_context", app_name="Zelda"),
            "Building context for Zelda…",
        )

    def test_format_thinking_phase_without_game(self):
        self.assertEqual(format_thinking_phase("proton_logs"), "Reading Proton logs…")
        self.assertEqual(format_thinking_phase("building_context"), "Building context…")

    def test_format_thinking_phase_screenshots(self):
        self.assertEqual(format_thinking_phase("screenshot_prep", attachment_count=1), "Preparing screenshot…")
        self.assertEqual(format_thinking_phase("screenshot_prep", attachment_count=2), "Preparing 2 screenshots…")

    def test_format_thinking_phase_truncates_long_game(self):
        long_name = "A" * 60
        out = format_thinking_phase("building_context", app_name=long_name)
        self.assertLessEqual(len(out), 240)
        self.assertIn("Building context for", out)

    def test_building_context_short_vs_long_elapsed(self):
        self.assertIn(
            "Building context",
            format_thinking_phase("building_context", elapsed_seconds=0),
        )
        self.assertEqual(
            format_thinking_phase("building_context", elapsed_seconds=2),
            "Still preparing…",
        )

    def test_extract_question_snippet(self):
        self.assertIn("shrine", extract_question_snippet("stuck on the shrine puzzle? help"))
        self.assertEqual(extract_question_snippet(""), "")

    def test_compose_thinking_blurb_weaves_question(self):
        out = compose_thinking_blurb("why is my fps low in elden ring", app_name="Elden Ring", request_id=7)
        self.assertIn("fps", out.lower())
        self.assertLessEqual(len(out), 240)

    def test_compose_thinking_blurb_always_sarcastic_without_character(self):
        out = compose_thinking_blurb("why is my fps low", request_id=3)
        lowered = out.lower()
        self.assertTrue(
            "oh joy" in lowered
            or "another crisis" in lowered
            or "fine." in lowered
            or lowered.startswith("yeah,"),
            msg=out,
        )

    def test_format_thinking_phase_woven_proton_logs(self):
        out = format_thinking_phase(
            "proton_logs",
            question="why crash on launch",
            app_name="Elden Ring",
            request_id=3,
        )
        self.assertIn("crash", out.lower())
        self.assertIn("Elden Ring", out)

    def test_format_thinking_phase_woven_tdp_read(self):
        out = format_thinking_phase(
            "tdp_read",
            question="what is my current tdp",
            request_id=5,
        )
        self.assertIn("tdp", out.lower())

    def test_format_thinking_phase_woven_screenshot_prep(self):
        out = format_thinking_phase(
            "screenshot_prep",
            question="what is this UI element",
            app_name="Zelda",
            attachment_count=1,
            request_id=9,
        )
        lowered = out.lower()
        self.assertTrue(
            "screenshot" in lowered
            or "capture" in lowered
            or "ui element" in lowered
            or "oh joy" in lowered
            or "another crisis" in lowered
            or lowered.startswith("yeah,"),
        )

    def test_format_thinking_phase_woven_model_retry(self):
        out = format_thinking_phase(
            "model_retry",
            question="help with stuttering",
            request_id=11,
        )
        self.assertIn("stuttering", out.lower())

    def test_format_thinking_phase_woven_building_context_elapsed(self):
        out = format_thinking_phase(
            "building_context",
            question="optimize settings",
            app_name="Zelda",
            elapsed_seconds=2,
            request_id=13,
        )
        self.assertIn("optimize", out.lower())

    def test_format_thinking_phase_starting_delegates_to_blurb(self):
        out = format_thinking_phase(
            "starting",
            question="why is my fps low",
            app_name="Elden Ring",
            request_id=17,
        )
        self.assertIn("fps", out.lower())

    def test_format_thinking_phase_woven_always_sarcastic(self):
        out = format_thinking_phase(
            "proton_logs",
            question="why crash on launch",
            app_name="Elden Ring",
            request_id=5,
        )
        lowered = out.lower()
        self.assertIn("crash", lowered)
        self.assertTrue(
            "oh joy" in lowered
            or "another crisis" in lowered
            or "fine." in lowered
            or lowered.startswith("yeah,"),
            msg=out,
        )


if __name__ == "__main__":
    unittest.main()
