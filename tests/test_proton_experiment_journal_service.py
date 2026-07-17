"""Tests for proton_experiment_journal_service."""

from __future__ import annotations

import json
import os
import tempfile
import unittest
from unittest.mock import patch

from backend.services.knowledge_base_service import stack_context_blocks
from backend.services import proton_experiment_journal_service as journal_mod
from backend.services.proton_experiment_journal_service import (
    JOURNAL_INJECT_BUDGET_BYTES,
    append_entry,
    clear_app,
    delete_entry,
    format_journal_for_prompt,
    journal_path,
    load_store,
    save_store,
    suggest_proton_version_from_logs,
    wipe_journal_file,
)


class ProtonExperimentJournalServiceTests(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self.home = self._tmpdir.name

    def tearDown(self):
        self._tmpdir.cleanup()

    def test_append_list_format_and_caps(self):
        store = load_store(self.home)
        merged = append_entry(
            store,
            "1245620",
            proton_version="Proton Experimental",
            launch_options="%command%",
            outcome="worse",
            note="crash on launch",
        )
        save_store(merged, home=self.home)
        reloaded = load_store(self.home)
        entries = reloaded["by_app_id"]["1245620"]["entries"]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["proton_version"], "Proton Experimental")
        self.assertEqual(entries[0]["outcome"], "worse")

    def test_format_journal_includes_do_not_resuggest_header(self):
        store = append_entry(
            load_store(self.home),
            "999",
            proton_version="GE-Proton9-15",
            outcome="better",
        )
        save_store(store, home=self.home)
        text = format_journal_for_prompt("999", home=self.home)
        self.assertIn("do not re-suggest", text.lower())
        self.assertIn("GE-Proton9-15", text)
        self.assertLessEqual(len(text.encode("utf-8")), JOURNAL_INJECT_BUDGET_BYTES + 64)

    def test_stack_context_order_proton_journal_kb(self):
        stacked = stack_context_blocks(
            proton_text="--- Proton logs ---\nline1",
            journal_text="--- Proton experiment journal ---\ntry1",
            knowledge_text="--- Local knowledge base ---\ncard1",
            max_total_bytes=10_000,
        )
        p_idx = stacked.index("Proton logs")
        j_idx = stacked.index("experiment journal")
        k_idx = stacked.index("Local knowledge")
        self.assertLess(p_idx, j_idx)
        self.assertLess(j_idx, k_idx)

    def test_delete_and_clear_app(self):
        store = append_entry(load_store(self.home), "42", proton_version="Proton 9.0")
        eid = store["by_app_id"]["42"]["entries"][0]["id"]
        store = delete_entry(store, "42", eid)
        self.assertNotIn("42", store.get("by_app_id", {}))
        store = append_entry(store, "42", proton_version="Proton 9.0")
        store = clear_app(store, "42")
        self.assertEqual(store.get("by_app_id"), {})

    def test_wipe_journal_file(self):
        store = append_entry(load_store(self.home), "1", proton_version="Proton")
        save_store(store, home=self.home)
        path = journal_path(self.home)
        self.assertTrue(os.path.isfile(path))
        wiped = wipe_journal_file(self.home)
        # wipe_journal_file only runs on non-Windows; on Windows returns False but file may remain.
        if not os.name == "nt":
            self.assertTrue(wiped)
            self.assertFalse(os.path.isfile(path))

    @unittest.skipUnless(os.name == "posix", "Proton log suggest requires Linux path guards")
    def test_suggest_proton_version_from_log(self):
        aid = "1245620"
        log_path = os.path.join(self.home, f"steam-{aid}.log")
        with open(log_path, "w", encoding="utf-8") as f:
            f.write("info: wine: using Proton Experimental build\n")
        hint = suggest_proton_version_from_logs(aid, home=self.home)
        self.assertIn("Proton Experimental", hint)

    def test_save_rejects_oversized_store(self):
        store = append_entry(load_store(self.home), "1", proton_version="Proton")
        with patch.object(journal_mod, "MAX_JSON_BYTES", 64):
            with self.assertRaises(ValueError):
                save_store(store, home=self.home)


if __name__ == "__main__":
    unittest.main()
