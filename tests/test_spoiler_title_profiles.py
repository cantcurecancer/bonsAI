import unittest

from backend.services.spoiler_title_profiles import (
    LOW_NARRATIVE_APP_IDS,
    PROTECT_PROGRESSION_APP_IDS,
    resolve_title_spoiler_profile,
    title_profile_is_low_narrative,
)


class SpoilerTitleProfilesTests(unittest.TestCase):
    def test_low_narrative_app_ids(self):
        for app_id in ("2321470", "550", "1222670"):
            self.assertEqual(resolve_title_spoiler_profile(app_id), "low_narrative")
            self.assertTrue(title_profile_is_low_narrative(app_id))

    def test_protect_progression_app_ids(self):
        for app_id in ("413150", "1145360", "1174180"):
            self.assertEqual(resolve_title_spoiler_profile(app_id), "protect_progression")
            self.assertFalse(title_profile_is_low_narrative(app_id))

    def test_soe_title_fallback_without_app_id(self):
        self.assertEqual(
            resolve_title_spoiler_profile("", "State of Emergency"),
            "low_narrative",
        )

    def test_unknown_title_stays_conservative(self):
        self.assertEqual(resolve_title_spoiler_profile("999999"), "unknown")
        self.assertEqual(resolve_title_spoiler_profile("", ""), "unknown")

    def test_matrix_counts(self):
        self.assertEqual(len(LOW_NARRATIVE_APP_IDS), 3)
        self.assertEqual(len(PROTECT_PROGRESSION_APP_IDS), 7)


if __name__ == "__main__":
    unittest.main()
