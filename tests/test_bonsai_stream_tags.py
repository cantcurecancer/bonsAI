"""Tests for ``<bonsai-status>`` stream tag extraction."""

import re
import unittest

from backend.services.bonsai_stream_tags import (
    compose_thinking_blurb,
    deterministic_thinking_phase_fallback,
    extract_bonsai_status,
    extract_question_snippet,
    format_thinking_phase,
    sanitize_thinking_summary,
)

_BANNED_PREFIXES = ("yeah", "fine.", "sure.", "oh joy", "right.")
_EMOJI_ONLY_LINES = ("🙄", "😮‍💨", "🫠", "🌳")


def _assert_no_banned_prefixes(text: str) -> None:
    lowered = text.lower()
    for prefix in _BANNED_PREFIXES:
        if prefix == "yeah":
            assert not re.match(r"^\s*yeah\b", lowered), f"unexpected Yeah opener in {text!r}"
        else:
            assert not lowered.startswith(prefix), f"unexpected prefix in {text!r}"
    assert "🙄🔥" not in text


class BonsaiStreamTagsTests(unittest.TestCase):
    def test_extract_and_strip(self):
        raw = "<bonsai-status>Checking GPU</bonsai-status>\n\nHello there."
        summary, stripped = extract_bonsai_status(raw)
        self.assertEqual(summary, "Checking GPU")
        self.assertEqual(stripped, "Hello there.")

    def test_extract_strips_lazy_yeah_opener(self):
        raw = "<bonsai-status>Yeah, checking GPU</bonsai-status>\n\nHello."
        summary, stripped = extract_bonsai_status(raw)
        self.assertEqual(summary, "checking GPU")
        self.assertEqual(stripped, "Hello.")

    def test_sanitize_thinking_summary_strips_yeah_variants(self):
        self.assertEqual(sanitize_thinking_summary("Yeah, on it"), "on it")
        self.assertEqual(sanitize_thinking_summary("Yeah — another crisis"), "another crisis")
        self.assertEqual(sanitize_thinking_summary("Fine. Sure. Working"), "Working")

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

    def test_extract_strips_multiple_status_tags(self):
        raw = "<bonsai-status>One</bonsai-status>\n\nBody\n\n<bonsai-status>Two</bonsai-status>\n\nTail."
        summary, stripped = extract_bonsai_status(raw)
        self.assertEqual(summary, "One")
        self.assertEqual(stripped, "Body\n\nTail.")

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

    def test_deterministic_phase_fallback_stable_within_tier(self):
        early = deterministic_thinking_phase_fallback(streaming=False, has_partial=False, elapsed_seconds=2)
        later = deterministic_thinking_phase_fallback(streaming=False, has_partial=False, elapsed_seconds=6)
        self.assertEqual(early, later)

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
        _assert_no_banned_prefixes(out)

    def test_compose_thinking_blurb_witty_without_character(self):
        samples = [
            compose_thinking_blurb("why is my fps low", request_id=i)
            for i in range(12)
        ]
        for out in samples:
            _assert_no_banned_prefixes(out)
        self.assertTrue(
            any(
                "crisis" in out.lower()
                or "on it" in out.lower()
                or "fascinating" in out.lower()
                or "watts" in out.lower()
                or "tdp" in out.lower()
                or out in _EMOJI_ONLY_LINES
                for out in samples
            ),
            msg=samples,
        )

    def test_compose_thinking_blurb_deadpan_character(self):
        samples = [
            compose_thinking_blurb(
                "how do I beat this shrine puzzle",
                request_id=i,
                character_enabled=True,
                character_preset_id="portal_glados",
            )
            for i in range(12)
        ]
        for out in samples:
            _assert_no_banned_prefixes(out)
        lowered = [out.lower() for out in samples]
        self.assertTrue(
            any(
                "acknowledged" in s
                or "no enthusiasm" in s
                or "inevitably" in s
                or "results pending" in s
                or "logged" in s
                for s in lowered
            )
            or any(out in _EMOJI_ONLY_LINES for out in samples),
            msg=samples,
        )

    def test_compose_thinking_blurb_omits_game_title_without_app(self):
        out = compose_thinking_blurb("generic question", request_id=1)
        self.assertNotIn("again? Alright", out)
        self.assertNotIn("Still struggling with", out)

    def test_compose_thinking_blurb_stable_without_elapsed(self):
        a = compose_thinking_blurb("help with stuttering", request_id=11, elapsed_seconds=0.0)
        b = compose_thinking_blurb("help with stuttering", request_id=11, elapsed_seconds=12.0)
        self.assertEqual(a, b)

    def test_format_thinking_phase_woven_proton_logs(self):
        samples = [
            format_thinking_phase(
                "proton_logs",
                question="why crash on launch",
                app_name="Elden Ring",
                request_id=i,
            )
            for i in range(12)
        ]
        for out in samples:
            _assert_no_banned_prefixes(out)
        self.assertTrue(
            any("crash" in out.lower() for out in samples)
            or any(out in _EMOJI_ONLY_LINES for out in samples),
            msg=samples,
        )
        non_emoji = [out for out in samples if out not in _EMOJI_ONLY_LINES]
        if non_emoji:
            self.assertTrue(any("Elden Ring" in out for out in non_emoji))

    def test_format_thinking_phase_woven_tdp_read(self):
        out = format_thinking_phase(
            "tdp_read",
            question="what is my current tdp",
            request_id=5,
        )
        self.assertIn("tdp", out.lower())
        _assert_no_banned_prefixes(out)

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
            or "pixels" in lowered
            or "capture" in lowered
            or "ui element" in lowered
            or "proof" in lowered,
            msg=out,
        )
        _assert_no_banned_prefixes(out)

    def test_format_thinking_phase_woven_model_retry(self):
        out = format_thinking_phase(
            "model_retry",
            question="help with stuttering",
            request_id=11,
        )
        self.assertIn("stuttering", out.lower())
        _assert_no_banned_prefixes(out)

    def test_format_thinking_phase_woven_building_context_elapsed(self):
        out = format_thinking_phase(
            "building_context",
            question="optimize settings",
            app_name="Zelda",
            elapsed_seconds=2,
            request_id=13,
        )
        self.assertIn("optimize", out.lower())
        _assert_no_banned_prefixes(out)

    def test_format_thinking_phase_starting_delegates_to_blurb(self):
        samples = [
            format_thinking_phase(
                "starting",
                question="why is my fps low",
                app_name="Elden Ring",
                request_id=i,
            )
            for i in range(12)
        ]
        for out in samples:
            _assert_no_banned_prefixes(out)
        self.assertTrue(
            any("fps" in out.lower() for out in samples)
            or any(out in _EMOJI_ONLY_LINES for out in samples),
            msg=samples,
        )

    def test_format_thinking_phase_searching_kb(self):
        self.assertEqual(format_thinking_phase("searching_kb"), "Searching knowledge base…")
        self.assertEqual(
            format_thinking_phase("searching_kb", app_name="Elden Ring"),
            "Searching knowledge base for Elden Ring…",
        )

    def test_format_thinking_phase_woven_no_lazy_prefixes(self):
        samples = [
            format_thinking_phase(
                "proton_logs",
                question="why crash on launch",
                app_name="Elden Ring",
                request_id=i,
            )
            for i in range(12)
        ]
        for out in samples:
            _assert_no_banned_prefixes(out)
        self.assertTrue(
            any("crash" in out.lower() for out in samples)
            or any(out in _EMOJI_ONLY_LINES for out in samples),
            msg=samples,
        )


if __name__ == "__main__":
    unittest.main()
