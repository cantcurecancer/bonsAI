import unittest

from backend.services.spoiler_risk_service import (
    build_spoiler_risk_signals,
    compute_heuristic_spoiler_risk_score,
    compute_spoiler_risk_band,
    extract_kb_section_types_from_text,
    parse_bonsai_spoiler_risk_tag,
    spoiler_risk_chip_label,
)
from backend.services.transparency_service import build_context_chips_manifest


class SpoilerRiskServiceTests(unittest.TestCase):
    def test_chip_label_length(self):
        for band in ("low", "med", "high"):
            label = spoiler_risk_chip_label(band)  # type: ignore[arg-type]
            self.assertLessEqual(len(label), 18)
            self.assertEqual(label, f"Spoiler risk: {band}")

    def test_parse_closed_model_tag(self):
        self.assertEqual(
            parse_bonsai_spoiler_risk_tag("Intro <bonsai-spoiler-risk>high</bonsai-spoiler-risk> done"),
            "high",
        )
        self.assertEqual(
            parse_bonsai_spoiler_risk_tag("<bonsai-spoiler-risk>medium</bonsai-spoiler-risk>"),
            "med",
        )

    def test_incomplete_model_tag_ignored(self):
        self.assertIsNone(parse_bonsai_spoiler_risk_tag("Still streaming <bonsai-spoiler-risk>med"))

    def test_low_risk_genre_scores_low(self):
        signals = build_spoiler_risk_signals(
            ask_mode="strategy",
            app_id="2321470",
            question="How do I beat Glyphid Dreadnought?",
            game_genres="Action Roguelike",
            kb_text="",
            asked_entity="Glyphid Dreadnought",
        )
        band = compute_spoiler_risk_band(signals)
        self.assertEqual(band, "low")

    def test_story_strategy_without_entity_scores_higher(self):
        signals = build_spoiler_risk_signals(
            ask_mode="strategy",
            app_id="1145360",
            question="Where should I go next?",
            game_genres="Adventure, Story Rich",
            kb_text="\n[Game / quest: Temple of Time]\nWalk north.",
        )
        band = compute_spoiler_risk_band(signals)
        self.assertIn(band, ("med", "high"))
        self.assertGreater(compute_heuristic_spoiler_risk_score(signals), 50.0)

    def test_model_tag_blends_with_heuristic(self):
        signals = build_spoiler_risk_signals(
            ask_mode="strategy",
            app_id="1145360",
            question="Where should I go next?",
            game_genres="Adventure, Story Rich",
        )
        heuristic_band = compute_spoiler_risk_band(signals)
        blended = compute_spoiler_risk_band(
            signals,
            assistant_text="<bonsai-spoiler-risk>low</bonsai-spoiler-risk>",
        )
        self.assertEqual(heuristic_band, "high")
        self.assertEqual(blended, "med")

    def test_extract_kb_section_types(self):
        kb = "\n[Zelda / boss: Ganon]\nTips\n\n[Zelda / area: Temple]\nGo east."
        self.assertEqual(extract_kb_section_types_from_text(kb), ["boss", "area"])

    def test_manifest_includes_spoiler_risk_chip(self):
        snapshot = {
            "ask_mode": "speed",
            "app_id": "550",
            "raw_question": "tips for the tank",
            "text_after_sanitizer": "tips for the tank",
            "spoiler_risk_signals": build_spoiler_risk_signals(
                ask_mode="speed",
                app_id="550",
                question="tips for the tank",
                game_genres="Action",
            ),
            "proton_log_excerpt_attached": False,
            "proton_log_sources": [],
            "proton_log_notes": "",
        }
        manifest = build_context_chips_manifest(snapshot=snapshot)
        chip = next(c for c in manifest["context_chips"] if c["id"] == "spoiler_risk")
        self.assertTrue(chip["label"].startswith("Spoiler risk: "))
        self.assertIn("Transparency only", chip["body"]["bullets"][-1])


if __name__ == "__main__":
    unittest.main()
