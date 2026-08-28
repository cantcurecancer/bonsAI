"""Tests for the DRG Survivor glossary prompt clause (roadmap: tap-to-define jargon)."""

import unittest

from backend.services.ollama_prompts import DRG_SURVIVOR_APP_ID, build_system_prompt


def _lookup_app_name(_app_id: str) -> str:
    return ""


def _lookup_vdf(_path: str) -> dict:
    return {}


class DrgSurvivorGlossaryPromptTests(unittest.TestCase):
    def test_glossary_clause_present_for_drg_survivor_app_id(self):
        text = build_system_prompt(
            "how do I deal with the praetorian",
            DRG_SURVIVOR_APP_ID,
            "Deep Rock Galactic: Survivor",
            [],
            [],
            _lookup_app_name,
            _lookup_vdf,
        )
        self.assertIn("GLOSSARY (Deep Rock Galactic: Survivor)", text)
        self.assertIn("kiting", text.lower())
        self.assertIn("overclock", text.lower())

    def test_glossary_clause_present_by_name_without_matching_app_id(self):
        """Same title reached via a manual/attachment name lookup, not the live running AppID."""
        text = build_system_prompt(
            "what should I upgrade first",
            "",
            "Deep Rock Galactic: Survivor",
            [],
            [],
            _lookup_app_name,
            _lookup_vdf,
        )
        self.assertIn("GLOSSARY (Deep Rock Galactic: Survivor)", text)

    def test_glossary_clause_absent_for_other_titles(self):
        text = build_system_prompt(
            "how do I beat this boss",
            "570",
            "Dota 2",
            [],
            [],
            _lookup_app_name,
            _lookup_vdf,
        )
        self.assertNotIn("GLOSSARY (Deep Rock Galactic", text)

    def test_glossary_clause_absent_with_no_game_context(self):
        text = build_system_prompt(
            "what is kiting",
            "",
            "",
            [],
            [],
            _lookup_app_name,
            _lookup_vdf,
        )
        self.assertNotIn("GLOSSARY (Deep Rock Galactic", text)

    def test_glossary_clause_present_in_strategy_mode_too(self):
        text = build_system_prompt(
            "how do I deal with the praetorian",
            DRG_SURVIVOR_APP_ID,
            "Deep Rock Galactic: Survivor",
            [],
            [],
            _lookup_app_name,
            _lookup_vdf,
            ask_mode="strategy",
        )
        self.assertIn("GLOSSARY (Deep Rock Galactic: Survivor)", text)


if __name__ == "__main__":
    unittest.main()
