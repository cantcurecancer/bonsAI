"""Tests for the output-side destructive advice guard."""

import unittest

from backend.services.destructive_advice_guard import (
    append_destructive_advice_notice,
    check_destructive_advice,
)


class DestructiveAdviceGuardCatchesDangerousCasesTests(unittest.TestCase):
    def test_flags_compatdata_deletion_without_backup(self):
        result = check_destructive_advice(
            "Just delete the compatdata folder for that AppID and relaunch the game."
        )
        self.assertTrue(result["flagged"])
        self.assertTrue(result["signals"])
        self.assertFalse(result["has_backup_mention"])

    def test_flags_wine_prefix_wipe_without_backup(self):
        result = check_destructive_advice(
            "You should wipe the wine prefix to fix that crash."
        )
        self.assertTrue(result["flagged"])

    def test_flags_proton_prefix_removal_without_backup(self):
        result = check_destructive_advice(
            "Remove the proton prefix entirely and Steam will rebuild it on next launch."
        )
        self.assertTrue(result["flagged"])

    def test_flags_save_data_deletion_without_backup(self):
        result = check_destructive_advice(
            "To reset your progress, delete your save data and restart the game."
        )
        self.assertTrue(result["flagged"])

    def test_flags_when_backup_mentioned_in_different_sentence_but_no_backup_word_at_all(self):
        # No backup language anywhere in the reply -- still flagged even though the destructive
        # sentence is not the first sentence.
        result = check_destructive_advice(
            "That crash is a known Proton issue. Erase the compatdata directory for this "
            "AppID to clear the corrupted config."
        )
        self.assertTrue(result["flagged"])

    def test_notice_appended_when_flagged(self):
        check = check_destructive_advice("Delete your save data to start over.")
        out = append_destructive_advice_notice("Delete your save data to start over.", check)
        self.assertIn("bonsAI safety check", out)
        self.assertIn("back up the folder", out)


class DestructiveAdviceGuardIgnoresInnocentCasesTests(unittest.TestCase):
    def test_does_not_flag_when_backup_step_present(self):
        result = check_destructive_advice(
            "Back up your save data first, then delete the compatdata folder and relaunch."
        )
        self.assertFalse(result["flagged"])
        self.assertTrue(result["has_backup_mention"])

    def test_does_not_flag_backup_phrased_as_make_a_copy(self):
        result = check_destructive_advice(
            "Make a copy of your save data somewhere safe, then delete the old compatdata folder."
        )
        self.assertFalse(result["flagged"])

    def test_does_not_flag_removing_a_mod(self):
        result = check_destructive_advice(
            "Remove the mod from your Steam Workshop subscriptions and restart Steam."
        )
        self.assertFalse(result["flagged"])
        self.assertEqual(result["signals"], [])

    def test_does_not_flag_deleting_a_shortcut(self):
        result = check_destructive_advice(
            "You can delete the desktop shortcut without affecting the game install."
        )
        self.assertFalse(result["flagged"])

    def test_does_not_flag_the_word_model_as_remove(self):
        # Regression guard for the same false-positive class the plan calls out for the mod
        # keyword gate (mod -> model) -- "remove" alone must not fire without a target.
        result = check_destructive_advice(
            "You could remove one of the smaller background models to free up disk space."
        )
        self.assertFalse(result["flagged"])

    def test_does_not_flag_advice_against_deleting(self):
        result = check_destructive_advice(
            "You don't need to delete your save data -- this bug is unrelated to saves."
        )
        self.assertFalse(result["flagged"])

    def test_does_not_flag_should_not_delete(self):
        result = check_destructive_advice(
            "You should not delete the compatdata folder for this -- try verifying "
            "game files in Steam instead."
        )
        self.assertFalse(result["flagged"])

    def test_does_not_flag_plain_troubleshooting_reply(self):
        result = check_destructive_advice(
            "Try lowering the TDP to 8 watts and see if the crash still happens. "
            "If it does, check the Proton version in the game's compatibility settings."
        )
        self.assertFalse(result["flagged"])
        self.assertEqual(result["signals"], [])

    def test_notice_not_appended_when_not_flagged(self):
        text = "Lower the TDP and try again."
        check = check_destructive_advice(text)
        self.assertEqual(append_destructive_advice_notice(text, check), text)

    def test_empty_text_not_flagged(self):
        result = check_destructive_advice("")
        self.assertFalse(result["flagged"])
        self.assertEqual(result["signals"], [])


if __name__ == "__main__":
    unittest.main()
