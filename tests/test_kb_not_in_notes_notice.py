"""Tests for the output-side "not in my notes" attribution notice."""

import unittest

from backend.services.kb_not_in_notes_notice import (
    _NOT_IN_NOTES_LINE,
    append_not_in_notes_notice,
    should_show_not_in_notes_notice,
)


class NotInNotesDecisionTests(unittest.TestCase):
    """should_show_not_in_notes_notice: the four coverage conditions plus Speed mode."""

    def test_covered_game_with_no_match_shows_the_notice(self):
        self.assertTrue(
            should_show_not_in_notes_notice(
                ask_mode="strategy", kb_attached=False, kb_coverage_status="sections"
            )
        )

    def test_covered_game_with_a_match_does_not_show_the_notice(self):
        self.assertFalse(
            should_show_not_in_notes_notice(
                ask_mode="strategy", kb_attached=True, kb_coverage_status="sections"
            )
        )

    def test_library_off_does_not_show_the_notice(self):
        # summarize_kb_coverage reports kb_off (not "sections") whenever the local knowledge
        # base setting is off, regardless of ask mode or attach state.
        self.assertFalse(
            should_show_not_in_notes_notice(
                ask_mode="strategy", kb_attached=False, kb_coverage_status="kb_off"
            )
        )

    def test_uncovered_game_does_not_show_the_notice(self):
        for status in ("no_sections", "app_unresolved", "no_app", "corpus_missing", "corpus_error"):
            with self.subTest(status=status):
                self.assertFalse(
                    should_show_not_in_notes_notice(
                        ask_mode="strategy", kb_attached=False, kb_coverage_status=status
                    )
                )

    def test_speed_mode_does_not_show_the_notice(self):
        # Even with a covered game and no match -- the two signals that otherwise qualify.
        self.assertFalse(
            should_show_not_in_notes_notice(
                ask_mode="speed", kb_attached=False, kb_coverage_status="sections"
            )
        )

    def test_expert_mode_with_no_match_shows_the_notice(self):
        # Expert is the other declared game-ask mode alongside Strategy.
        self.assertTrue(
            should_show_not_in_notes_notice(
                ask_mode="expert", kb_attached=False, kb_coverage_status="sections"
            )
        )


class NotInNotesAppendTests(unittest.TestCase):
    """append_not_in_notes_notice: wording and composition with the safety notice."""

    def test_exact_wording(self):
        out = append_not_in_notes_notice("Here is how you beat the boss.", True)
        self.assertIn(_NOT_IN_NOTES_LINE, out)
        self.assertIn(
            "Not in my notes — this answer is from the model's own knowledge.", out
        )

    def test_not_shown_leaves_reply_untouched(self):
        original = "Here is how you beat the boss."
        self.assertEqual(append_not_in_notes_notice(original, False), original)

    def test_stacks_after_an_existing_safety_notice_in_a_sensible_order(self):
        # A reply that already ends with the destructive-advice safety notice gets both
        # footers, safety first and the attribution note last -- appended in whichever order
        # the caller adds them, not reordered here.
        reply_with_safety_notice = (
            "Try deleting the existing prefix folder and letting Steam rebuild it."
            "\n\n—\n**bonsAI safety check:** this reply describes deleting save data, a "
            "Wine/Proton prefix, or compatdata, without a clear backup step. That is permanent "
            "unless the game uses Steam Cloud for saves -- back up the folder before deleting "
            "anything."
        )

        out = append_not_in_notes_notice(reply_with_safety_notice, True)

        self.assertIn("bonsAI safety check", out)
        self.assertIn(_NOT_IN_NOTES_LINE, out)
        self.assertLess(
            out.index("bonsAI safety check"),
            out.index(_NOT_IN_NOTES_LINE),
            "the attribution note should land after the safety notice, not before it",
        )


if __name__ == "__main__":
    unittest.main()
