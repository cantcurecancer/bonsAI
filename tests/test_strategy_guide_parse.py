import unittest

from backend.services.strategy_guide_parse import (
    STRATEGY_FOLLOWUP_PREFIX,
    extract_strategy_guide_branches,
    hide_incomplete_strategy_branch_fence,
    is_strategy_followup_question,
)


class StrategyGuideParseTests(unittest.TestCase):
    def test_is_strategy_followup_question(self):
        self.assertTrue(is_strategy_followup_question(f"{STRATEGY_FOLLOWUP_PREFIX} I'm at: a."))
        self.assertTrue(is_strategy_followup_question(f"  \n{STRATEGY_FOLLOWUP_PREFIX} x"))
        self.assertFalse(is_strategy_followup_question("Help with Water Temple"))

    def test_extract_strips_valid_fence(self):
        raw = (
            "Here is some coaching.\n\n"
            "```bonsai-strategy-branches\n"
            '{"question":"Where?","options":[{"id":"a","label":"Start"},{"id":"b","label":"End"}]}\n'
            "```\n"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertEqual(payload["question"], "Where?")
        self.assertEqual(len(payload["options"]), 2)
        self.assertEqual(payload["options"][0]["label"], "Start")
        self.assertNotIn("bonsai-strategy-branches", visible)
        self.assertIn("coaching", visible)

    def test_extract_malformed_returns_original(self):
        raw = "text only ```bonsai-strategy-branches\nnot json\n```"
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNone(payload)
        self.assertEqual(visible, raw)

    def test_extract_too_few_options(self):
        raw = (
            'Intro\n```bonsai-strategy-branches\n{"question":"Q?","options":[{"id":"a","label":"Only"}]}\n```'
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNone(payload)
        self.assertEqual(visible, raw)

    def test_extract_trailing_comma_in_options(self):
        raw = (
            "Intro\n```bonsai-strategy-branches\n"
            '{"question":"Where?","options":[{"id":"a","label":"Start"},{"id":"b","label":"End",}],}\n'
            "```\n"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["question"], "Where?")
        self.assertEqual(len(payload["options"]), 2)

    def test_extract_bracket_tag_urlencoded_json(self):
        """Models sometimes emit [bonsai-strategy-branches] (%7B...}) instead of a markdown fence."""
        raw = (
            "Coach intro.\n"
            '[bonsai-strategy-branches] (%7B"question":"Where are you at in %5BWater Temple%5D?",'
            '"options":[{"id":"a","label":"Entrance area with a large waterfall"},'
            '{"id":"b","label":"Interior rooms with puzzles and enemies"}]})\n'
            "As your trusty guide…"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["question"], "Where are you at in [Water Temple]?")
        self.assertEqual(len(payload["options"]), 2)
        self.assertEqual(payload["options"][0]["label"], "Entrance area with a large waterfall")
        self.assertNotIn("bonsai-strategy-branches", visible)
        self.assertIn("Coach intro", visible)
        self.assertIn("trusty guide", visible)

    def test_extract_bracket_tag_raw_json_in_parens(self):
        raw = (
            "Hi\n[BonsAI-Strategy-Branches] ("
            '{"question":"Pick?","options":[{"id":"a","label":"One"},{"id":"b","label":"Two"}]})\n'
            "Tail"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["question"], "Pick?")
        self.assertEqual(len(payload["options"]), 2)
        self.assertNotIn("[BonsAI", visible, msg=visible)

    def test_extract_json_fence_branch_payload(self):
        """Models often emit ```json instead of ```bonsai-strategy-branches."""
        raw = (
            "Since you're asking about 60fps settings, I need to know more.\n\n"
            "```json\n"
            '{"question":"Are you looking for general graphical settings or optimization '
            'advice for a specific in-game situation?",'
            '"options":[{"id":"a","label":"General Graphical Settings"},'
            '{"id":"b","label":"Optimization for Specific Gameplay"}]}\n'
            "```\n"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertIn("graphical settings", payload["question"].lower())
        self.assertEqual(len(payload["options"]), 2)
        self.assertNotIn("```", visible)
        self.assertNotIn('"options"', visible)
        self.assertIn("60fps", visible)

    def test_extract_json_fence_ignores_tdp_block(self):
        raw = (
            "Lower TDP for menus.\n\n"
            '```json\n{"tdp_watts": 7, "gpu_clock_mhz": null}\n```\n'
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNone(payload)
        self.assertEqual(visible, raw)

    def test_extract_unclosed_bonsai_fence(self):
        """Gemma often omits the closing ``` — recover JSON from remainder."""
        raw = (
            "For now, let's start with display targets.\n\n"
            "```bonsai-strategy-branches\n"
            '{"question":"What is your preferred display resolution?",'
            '"options":[{"id":"a","label":"1280x800"},{"id":"b","label":"1080p"},'
            '{"id":"c","label":"4K"},{"id":"d","label":"Enter your own"}]}'
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(len(payload["options"]), 4)
        self.assertNotIn('"options"', visible)
        self.assertIn("display targets", visible)

    def test_extract_fence_with_inline_language_tag(self):
        raw = (
            "Intro\n"
            "```bonsai-strategy-branches json\n"
            '{"question":"Where?","options":[{"id":"a","label":"Start"},{"id":"b","label":"End"}]}\n'
            "```\n"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["question"], "Where?")
        self.assertNotIn("```", visible)

    def test_extract_truncated_json_missing_closers(self):
        """Deck log: model closed fence before finishing ]}."""
        raw = (
            "For now, let's start with display targets.\n\n"
            "```bonsai-strategy-branches\n"
            '{"question":"What is your primary goal right now?",'
            '"options":[{"id":"a","label":"Maximize visual fidelity (aim for 60fps if possible)"},'
            '{"id":"b","label":"Prioritize stable frame rate over high graphics"},'
            '{"id":"c","label":"Enter your own settings"}\n'
            "```\n"
        )
        visible, payload = extract_strategy_guide_branches(raw)
        self.assertIsNotNone(payload)
        self.assertEqual(len(payload["options"]), 3)
        self.assertNotIn('"options"', visible)

    def test_hide_strategy_fence_during_stream_even_when_closed(self):
        raw = (
            "Intro prose.\n\n"
            "```bonsai-strategy-branches\n"
            '{"question":"Q?","options":[{"id":"a","label":"A"},{"id":"b","label":"B"}]}\n'
            "```\n"
        )
        hidden = hide_incomplete_strategy_branch_fence(raw)
        self.assertEqual(hidden, "Intro prose.")
        self.assertNotIn('"options"', hidden)


# Strategy checklist tests

    def test_extract_checklist_strips_valid_fence(self):
        from backend.services.strategy_guide_parse import extract_strategy_checklist

        raw = (
            "Step one: equip boots.\n\n"
            "```bonsai-strategy-checklist\n"
            '{"title":"Water Temple","items":[{"id":"1","label":"Equip boots"},{"id":"2","label":"Drain room"}]}\n'
            "```\n\n"
            "**If you want to cheat…**\n"
            "- Skip with glitch X\n"
        )
        visible, payload = extract_strategy_checklist(raw)
        self.assertEqual(payload["title"], "Water Temple")
        self.assertEqual(len(payload["items"]), 2)
        self.assertNotIn("bonsai-strategy-checklist", visible)
        self.assertIn("cheat", visible)

    def test_extract_checklist_malformed_returns_original(self):
        from backend.services.strategy_guide_parse import extract_strategy_checklist

        raw = "text ```bonsai-strategy-checklist\nbad\n```"
        visible, payload = extract_strategy_checklist(raw)
        self.assertIsNone(payload)
        self.assertEqual(visible, raw)

    def test_format_strategy_checklist_state_block(self):
        from backend.services.strategy_guide_parse import format_strategy_checklist_state_block

        block = format_strategy_checklist_state_block(
            {
                "title": "Boss",
                "items": [{"id": "a", "label": "Phase 1"}, {"id": "b", "label": "Phase 2"}],
                "checked_ids": ["a"],
            }
        )
        self.assertIn("PLUGIN CHECKLIST STATE", block)
        self.assertIn("Phase 1", block)
        self.assertIn("Phase 2", block)


if __name__ == "__main__":
    unittest.main()
