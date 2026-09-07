"""Tests for the knowledge-base follow-up memory (remember/recall/forget, and the phrasing and
search-words helpers built on top of it).
"""

import unittest

from backend.services import kb_followup_memory


class KbFollowupMemoryTests(unittest.TestCase):
    def setUp(self):
        kb_followup_memory.forget()

    def tearDown(self):
        kb_followup_memory.forget()

    def test_remember_then_recall_same_game_returns_the_subject(self):
        kb_followup_memory.remember(
            app_id="2380520", app_name="Hades", text_resolved_title="", subject="Megara"
        )
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="2380520", app_name="Hades", text_resolved_title=""
            ),
            "Megara",
        )

    def test_recall_with_nothing_stored_is_blank(self):
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="2380520", app_name="Hades", text_resolved_title=""
            ),
            "",
        )

    def test_recall_falls_back_to_app_name_when_no_app_id(self):
        kb_followup_memory.remember(
            app_id="", app_name="Hades", text_resolved_title="", subject="Megara"
        )
        self.assertEqual(
            kb_followup_memory.recall(app_id="", app_name="Hades", text_resolved_title=""),
            "Megara",
        )

    def test_recall_falls_back_to_text_resolved_title_when_nothing_is_running(self):
        kb_followup_memory.remember(
            app_id="", app_name="", text_resolved_title="Hades", subject="Megara"
        )
        self.assertEqual(
            kb_followup_memory.recall(app_id="", app_name="", text_resolved_title="Hades"),
            "Megara",
        )

    def test_a_game_change_clears_the_memory(self):
        kb_followup_memory.remember(
            app_id="2380520", app_name="Hades", text_resolved_title="", subject="Megara"
        )
        # Asking about a different game does not see Hades's subject...
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="548430", app_name="Deep Rock Galactic: Survivor", text_resolved_title=""
            ),
            "",
        )
        # ...and the switch clears the old game's memory rather than merely hiding it: asking
        # about Hades again afterwards does not get Megara back.
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="2380520", app_name="Hades", text_resolved_title=""
            ),
            "",
        )

    def test_forget_clears_the_memory(self):
        kb_followup_memory.remember(
            app_id="2380520", app_name="Hades", text_resolved_title="", subject="Megara"
        )
        kb_followup_memory.forget()
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="2380520", app_name="Hades", text_resolved_title=""
            ),
            "",
        )

    def test_remembering_a_blank_subject_stores_nothing(self):
        kb_followup_memory.remember(
            app_id="2380520", app_name="Hades", text_resolved_title="", subject="   "
        )
        self.assertEqual(
            kb_followup_memory.recall(
                app_id="2380520", app_name="Hades", text_resolved_title=""
            ),
            "",
        )

    def test_remembering_with_no_game_identity_stores_nothing(self):
        kb_followup_memory.remember(
            app_id="", app_name="", text_resolved_title="", subject="Megara"
        )
        self.assertEqual(
            kb_followup_memory.recall(app_id="", app_name="", text_resolved_title=""), ""
        )


class LooksLikeFollowupTests(unittest.TestCase):
    def test_what_about_her_second_phase_reads_as_a_followup(self):
        self.assertTrue(kb_followup_memory.looks_like_followup("what about her second phase"))

    def test_what_about_its_second_phase_reads_as_a_followup(self):
        self.assertTrue(kb_followup_memory.looks_like_followup("what about its second phase"))

    def test_how_about_the_next_one_reads_as_a_followup(self):
        self.assertTrue(kb_followup_memory.looks_like_followup("how about the next one"))

    def test_and_the_third_phase_reads_as_a_followup(self):
        self.assertTrue(kb_followup_memory.looks_like_followup("and the third phase"))

    def test_a_short_question_leaning_on_it_reads_as_a_followup(self):
        self.assertTrue(kb_followup_memory.looks_like_followup("how do i beat it"))

    def test_a_fresh_named_question_does_not_read_as_a_followup(self):
        self.assertFalse(
            kb_followup_memory.looks_like_followup("how do i beat the glyphid dreadnought")
        )

    def test_a_long_sentence_that_happens_to_contain_it_is_not_a_followup(self):
        # Long enough that it is plainly spelling out its own question, not riding on the last one.
        long_question = (
            "how do i beat it when it keeps charging at me across the whole arena without "
            "any warning at all"
        )
        self.assertFalse(kb_followup_memory.looks_like_followup(long_question))

    def test_blank_question_is_not_a_followup(self):
        self.assertFalse(kb_followup_memory.looks_like_followup(""))


class AugmentSearchWordsTests(unittest.TestCase):
    def test_adds_the_remembered_subject_to_a_followup_question(self):
        out = kb_followup_memory.augment_search_words(
            "what about her second phase", remembered_subject="Megara"
        )
        self.assertEqual(out, "what about her second phase Megara")

    def test_leaves_a_non_followup_question_unchanged(self):
        out = kb_followup_memory.augment_search_words(
            "how do i beat the glyphid dreadnought", remembered_subject="Megara"
        )
        self.assertEqual(out, "how do i beat the glyphid dreadnought")

    def test_leaves_the_question_unchanged_when_nothing_is_remembered(self):
        out = kb_followup_memory.augment_search_words(
            "what about her second phase", remembered_subject=""
        )
        self.assertEqual(out, "what about her second phase")


if __name__ == "__main__":
    unittest.main()
