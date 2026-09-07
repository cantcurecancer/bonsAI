"""Tests for the output-side "not in my notes" and "no tip for this" attribution notices."""

import unittest

from backend.services.kb_not_in_notes_notice import (
    _NOT_IN_NOTES_LINE,
    _NO_TIP_FOR_THIS_LINE,
    append_no_tip_for_this_notice,
    append_not_in_notes_notice,
    should_show_no_tip_for_this_notice,
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


class NoTipForThisDecisionTests(unittest.TestCase):
    """should_show_no_tip_for_this_notice: routed-to-tips, nothing attached, any Ask mode."""

    def test_routed_to_tips_with_nothing_attached_shows_the_line(self):
        self.assertTrue(
            should_show_no_tip_for_this_notice(kb_attached=False, kb_domain="compat")
        )

    def test_routed_to_tips_with_a_tip_attached_does_not_show_the_line(self):
        self.assertFalse(
            should_show_no_tip_for_this_notice(kb_attached=True, kb_domain="compat")
        )

    def test_speed_mode_still_shows_the_line(self):
        # Unlike the sibling notice, this one has no Ask-mode gate -- the brief is explicit
        # that a tip search runs in any mode, so the line can too. There is no ask_mode
        # parameter to pass: the function's signature is the proof.
        self.assertTrue(
            should_show_no_tip_for_this_notice(kb_attached=False, kb_domain="compat")
        )

    def test_routed_to_notes_instead_does_not_show_the_line(self):
        # domain == "strategy" means this turn's search looked in the notes, not the tips.
        self.assertFalse(
            should_show_no_tip_for_this_notice(kb_attached=False, kb_domain="strategy")
        )

    def test_not_routed_at_all_does_not_show_the_line(self):
        # The library-off case: should_retrieve_knowledge never returns "compat" while the
        # setting is off, so kb_domain stays "" and this line never fires from that alone.
        self.assertFalse(
            should_show_no_tip_for_this_notice(kb_attached=False, kb_domain="")
        )

    def test_missing_corpus_does_not_show_the_line(self):
        self.assertFalse(
            should_show_no_tip_for_this_notice(
                kb_attached=False,
                kb_domain="compat",
                kb_unavailable_reason="corpus_missing",
            )
        )

    def test_a_tip_trimmed_for_space_does_not_show_the_line(self):
        # A real tip was found and scored -- the context budget cut it, which is a different
        # fact from "no tip fit". kb_attached is already False in this case (the tip never
        # reached the model), so kb_notes is the only signal that tells the two apart.
        self.assertFalse(
            should_show_no_tip_for_this_notice(
                kb_attached=False,
                kb_domain="compat",
                kb_notes="dropped_by_context_budget",
            )
        )

    def test_floors_own_signal_shows_the_line_once_it_lands(self):
        # Forward-compatibility case: once lane C's floor ships, an unattached compat turn's
        # kb_notes reads "routed_nothing_fit (...)" instead of the plainer "no_hit (...)". Both
        # must show the line.
        self.assertTrue(
            should_show_no_tip_for_this_notice(
                kb_attached=False,
                kb_domain="compat",
                kb_notes="routed_nothing_fit (some_reason)",
            )
        )
        self.assertTrue(
            should_show_no_tip_for_this_notice(
                kb_attached=False,
                kb_domain="compat",
                kb_notes="no_hit (some_reason)",
            )
        )


class NoTipForThisAppendTests(unittest.TestCase):
    """append_no_tip_for_this_notice: wording and composition with the safety notice."""

    def test_exact_wording(self):
        out = append_no_tip_for_this_notice("Try restarting Steam.", True)
        self.assertIn(_NO_TIP_FOR_THIS_LINE, out)
        self.assertIn(
            "No tip for this — this answer is from the model's own knowledge.", out
        )

    def test_not_shown_leaves_reply_untouched(self):
        original = "Try restarting Steam."
        self.assertEqual(append_no_tip_for_this_notice(original, False), original)

    def test_stacks_after_an_existing_safety_notice_in_a_sensible_order(self):
        reply_with_safety_notice = (
            "Try deleting the existing prefix folder and letting Steam rebuild it."
            "\n\n—\n**bonsAI safety check:** this reply describes deleting save data, a "
            "Wine/Proton prefix, or compatdata, without a clear backup step. That is permanent "
            "unless the game uses Steam Cloud for saves -- back up the folder before deleting "
            "anything."
        )

        out = append_no_tip_for_this_notice(reply_with_safety_notice, True)

        self.assertIn("bonsAI safety check", out)
        self.assertIn(_NO_TIP_FOR_THIS_LINE, out)
        self.assertLess(
            out.index("bonsAI safety check"),
            out.index(_NO_TIP_FOR_THIS_LINE),
            "the attribution note should land after the safety notice, not before it",
        )


class TheTwoLinesNeverBothAppearTests(unittest.TestCase):
    """Both decision functions can return True for the same inputs (only kb_domain differs
    between the two on the same turn) -- proving the module's own functions are mutually
    exclusive is not possible without the call site's extra guard, so this proves the two
    functions do not enforce it *themselves*, which is why game_ai_request.py must and does."""

    def test_both_functions_would_fire_together_without_the_call_sites_guard(self):
        # An Expert ask about a game whose notes are covered, but this particular turn got
        # routed to the tip sheet (kb_domain == "compat") and nothing attached: both decision
        # functions read True in isolation. game_ai_request.py is what stops both lines landing
        # on the same reply -- see its test in test_kb_not_in_notes_wiring.py.
        show_not_in_notes = should_show_not_in_notes_notice(
            ask_mode="expert", kb_attached=False, kb_coverage_status="sections"
        )
        show_no_tip = should_show_no_tip_for_this_notice(
            kb_attached=False, kb_domain="compat"
        )
        self.assertTrue(show_not_in_notes)
        self.assertTrue(show_no_tip)


if __name__ == "__main__":
    unittest.main()
