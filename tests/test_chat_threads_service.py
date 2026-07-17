"""Unit tests for chat_threads_service."""

import os
import tempfile
import unittest

from backend.services.chat_threads_service import (
    MAX_THREADS,
    append_turn,
    create_thread,
    delete_thread,
    find_thread_by_pending_request,
    heuristic_thread_label,
    list_thread_summaries,
    load_thread,
    update_thread_strategy_checklist,
    wipe_all_threads,
)


class ChatThreadsServiceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.settings_dir = self.tmp

    def tearDown(self):
        import shutil

        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_create_and_append_turns(self):
        thread = create_thread(
            self.settings_dir,
            first_question="How do I parry?",
            app_name="Elden Ring",
        )
        self.assertIn("Elden Ring", thread["label"])
        tid = thread["id"]
        append_turn(
            self.settings_dir,
            tid,
            role="user",
            text="How do I parry?",
            request_id=1,
        )
        saved = append_turn(
            self.settings_dir,
            tid,
            role="assistant",
            text="Practice the timing window.",
            request_id=1,
        )
        self.assertIsNotNone(saved)
        assert saved is not None
        self.assertEqual(len(saved["turns"]), 2)
        self.assertIsNone(saved["pending_request_id"])

    def test_find_by_pending_request(self):
        thread = create_thread(self.settings_dir, first_question="Hi")
        tid = thread["id"]
        append_turn(self.settings_dir, tid, role="user", text="Hi", request_id=42)
        found = find_thread_by_pending_request(self.settings_dir, 42)
        self.assertIsNotNone(found)
        assert found is not None
        self.assertEqual(found["id"], tid)

    def test_prune_at_cap(self):
        for i in range(MAX_THREADS + 2):
            create_thread(self.settings_dir, label=f"thread-{i}")
        summaries = list_thread_summaries(self.settings_dir)
        self.assertLessEqual(len(summaries), MAX_THREADS)

    def test_delete_thread(self):
        thread = create_thread(self.settings_dir, label="delete-me")
        tid = thread["id"]
        self.assertTrue(delete_thread(self.settings_dir, tid))
        self.assertIsNone(load_thread(self.settings_dir, tid))

    def test_strategy_checklist_on_thread(self):
        thread = create_thread(self.settings_dir, label="strategy")
        tid = thread["id"]
        updated = update_thread_strategy_checklist(
            self.settings_dir,
            tid,
            {
                "title": "Boss prep",
                "items": [{"id": "1", "label": "Heal"}, {"id": "2", "label": "Buff"}],
                "checked_ids": ["1"],
            },
        )
        self.assertIsNotNone(updated)
        assert updated is not None
        cl = updated.get("strategy_checklist")
        self.assertIsInstance(cl, dict)
        assert isinstance(cl, dict)
        self.assertEqual(cl.get("checked_ids"), ["1"])

    def test_heuristic_label(self):
        self.assertIn("foo", heuristic_thread_label("foo bar baz", ""))
        self.assertIn("Game", heuristic_thread_label("question", "Game"))

    def test_wipe_all(self):
        create_thread(self.settings_dir, label="a")
        create_thread(self.settings_dir, label="b")
        wipe_all_threads(self.settings_dir)
        self.assertEqual(list_thread_summaries(self.settings_dir), [])


if __name__ == "__main__":
    unittest.main()
