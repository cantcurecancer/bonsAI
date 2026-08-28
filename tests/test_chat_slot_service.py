"""Unit tests for chat_slot_service."""

import tempfile
import unittest

from backend.services.chat_slot_service import (
    MAX_CHAT_SLOTS,
    append_turn,
    create_slot,
    delete_slot,
    heuristic_slot_label,
    list_slot_summaries,
    load_slot,
    save_slot,
    update_slot_label,
    wipe_all_slots,
)


class ChatSlotServiceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.settings_dir = self.tmp

    def tearDown(self):
        import shutil

        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_create_and_append_turns(self):
        slot = create_slot(
            self.settings_dir,
            first_question="How do I parry?",
            app_name="Elden Ring",
        )
        self.assertIn("Elden Ring", slot["label"])
        sid = slot["id"]
        append_turn(
            self.settings_dir,
            sid,
            role="user",
            text="How do I parry?",
            request_id=1,
        )
        saved = append_turn(
            self.settings_dir,
            sid,
            role="assistant",
            text="Practice the timing window.",
            request_id=1,
        )
        self.assertIsNotNone(saved)
        assert saved is not None
        self.assertEqual(len(saved["turns"]), 2)

    def test_turns_persist_the_app_id_they_were_asked_under(self):
        """Regression (DRG-GLOSSARY-01, measured on device 2026-08-28): nothing recorded which
        game a turn was about, so a reply that had glossary chips while it streamed lost them
        the moment it settled into history and was re-read from the saved chat.
        """
        slot = create_slot(self.settings_dir, first_question="What is kiting?", app_name="Deep Rock")
        sid = slot["id"]
        append_turn(self.settings_dir, sid, role="user", text="What is kiting?", app_id="548430")
        saved = append_turn(
            self.settings_dir,
            sid,
            role="assistant",
            text="Keep moving and shoot behind you.",
            app_id="548430",
        )
        assert saved is not None
        self.assertEqual([t["app_id"] for t in saved["turns"]], ["548430", "548430"])

        reloaded = load_slot(self.settings_dir, sid)
        assert reloaded is not None
        self.assertEqual(reloaded["turns"][-1]["app_id"], "548430")

    def test_turns_saved_before_the_field_existed_load_with_an_empty_app_id(self):
        """A slot file written by an older build has no ``app_id`` on its turns. It must load
        rather than fail — the frontend falls back to the slot's ``origin_app_id`` for these.
        """
        slot = create_slot(self.settings_dir, origin_app_id="548430", label="old chat")
        sid = slot["id"]
        legacy = {
            **slot,
            "turns": [
                {"id": "u1", "role": "user", "text": "What is kiting?"},
                {"id": "a1", "role": "assistant", "text": "Keep moving."},
            ],
        }
        save_slot(self.settings_dir, legacy)
        reloaded = load_slot(self.settings_dir, sid)
        assert reloaded is not None
        self.assertEqual([t["app_id"] for t in reloaded["turns"]], ["", ""])
        self.assertEqual(reloaded["origin_app_id"], "548430")

    def test_turn_app_id_is_bounded(self):
        slot = create_slot(self.settings_dir, label="bounds")
        saved = append_turn(
            self.settings_dir, slot["id"], role="user", text="q", app_id=" " + ("9" * 80) + " "
        )
        assert saved is not None
        self.assertEqual(saved["turns"][-1]["app_id"], "9" * 32)

    def test_assistant_turn_persists_transparency_snapshot(self):
        """Regression: assistant turns used to save no transparency at all, so a slot restored
        from disk could never show more than the newest archived turn in SessionContextStrip
        (chatSlotTurns.ts hardcoded the field to null because there was nothing to read).
        """
        slot = create_slot(self.settings_dir, first_question="How do I parry?", app_name="Elden Ring")
        sid = slot["id"]
        snapshot = {
            "route": "ollama",
            "success": True,
            "context_chips": [{"id": "kb", "rank": 1, "label": "KB", "attached": True}],
            "overflow_skips": [],
        }
        saved = append_turn(
            self.settings_dir,
            sid,
            role="assistant",
            text="Practice the timing window.",
            request_id=1,
            transparency=snapshot,
        )
        assert saved is not None
        assistant_turn = saved["turns"][-1]
        self.assertEqual(assistant_turn["transparency"], snapshot)

        # Round-trips through disk unchanged.
        reloaded = load_slot(self.settings_dir, sid)
        assert reloaded is not None
        self.assertEqual(reloaded["turns"][-1]["transparency"], snapshot)

    def test_transparency_with_no_chips_is_dropped(self):
        """A snapshot with an empty context_chips list is indistinguishable from no snapshot to
        the frontend filter (`t.transparency && chipsFromSnapshot(t.transparency).length > 0`),
        so persistence normalizes it to None rather than storing a chip-less placeholder.
        """
        slot = create_slot(self.settings_dir, label="chipless")
        sid = slot["id"]
        saved = append_turn(
            self.settings_dir,
            sid,
            role="assistant",
            text="answer",
            transparency={"route": "ollama", "success": True, "context_chips": []},
        )
        assert saved is not None
        self.assertIsNone(saved["turns"][-1]["transparency"])

    def test_user_turn_without_transparency_stores_none(self):
        slot = create_slot(self.settings_dir, label="no-transparency")
        sid = slot["id"]
        saved = append_turn(self.settings_dir, sid, role="user", text="question")
        assert saved is not None
        self.assertIsNone(saved["turns"][-1]["transparency"])

    def test_prune_at_five_slots(self):
        for i in range(MAX_CHAT_SLOTS + 2):
            create_slot(self.settings_dir, label=f"slot-{i}")
        summaries = list_slot_summaries(self.settings_dir)
        self.assertLessEqual(len(summaries), MAX_CHAT_SLOTS)

    def test_delete_slot(self):
        slot = create_slot(self.settings_dir, label="delete-me")
        sid = slot["id"]
        self.assertTrue(delete_slot(self.settings_dir, sid))
        self.assertIsNone(load_slot(self.settings_dir, sid))

    def test_rename_persists_and_reindexes(self):
        slot = create_slot(self.settings_dir, label="old-name")
        sid = slot["id"]
        updated = update_slot_label(self.settings_dir, sid, "Elden Ring build")
        self.assertIsNotNone(updated)
        assert updated is not None
        self.assertEqual(updated["label"], "Elden Ring build")
        summaries = list_slot_summaries(self.settings_dir)
        self.assertEqual(len(summaries), 1)
        self.assertEqual(summaries[0]["label"], "Elden Ring build")

    def test_heuristic_label(self):
        self.assertIn("foo", heuristic_slot_label("foo bar baz", ""))
        self.assertIn("Game", heuristic_slot_label("question", "Game"))

    def test_wipe_all(self):
        create_slot(self.settings_dir, label="a")
        create_slot(self.settings_dir, label="b")
        wipe_all_slots(self.settings_dir)
        self.assertEqual(list_slot_summaries(self.settings_dir), [])


if __name__ == "__main__":
    unittest.main()
