"""Ollama pull error formatting and registry tag partition."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from backend.services.local_ollama_setup_service import _format_ollama_pull_failure
from backend.services.ollama_catalog_service import partition_pull_tags_by_registry


class OllamaPullFailureFormatTests(unittest.TestCase):
    def test_manifest_missing_hint(self):
        msg = _format_ollama_pull_failure(
            "gemma4:4b",
            1,
            ["Error: pull model manifest: file does not exist"],
        )
        self.assertIn("exit code 1", msg)
        self.assertIn("not on the Ollama library", msg)
        self.assertIn("qwen2.5vl:3b", msg)

    def test_advice_comes_before_the_raw_command_output(self):
        """What to do about it leads; the command's own words follow.

        Measured on the Deck 2026-09-05 (PULL-CUSTOM-02), typing a made-up name into the pull
        picker's new custom field. The message opened with the exit code and four redraws of
        "pulling manifest" and only ended with the sentence a person can act on.
        """
        msg = _format_ollama_pull_failure(
            "not-a-real-model-xyz",
            1,
            [
                "pulling manifest ⠋",
                "pulling manifest ⠙",
                "pulling manifest ⠹",
                "pulling manifest",
                "Error: pull model manifest: file does not exist",
            ],
        )
        advice_at = msg.index("not on the Ollama library")
        raw_at = msg.index("ollama pull not-a-real-model-xyz failed")
        self.assertLess(advice_at, raw_at, "the actionable sentence must come first")
        self.assertTrue(msg.startswith("Tag «not-a-real-model-xyz»"), msg[:80])

    def test_spinner_redraws_are_collapsed_to_one_line(self):
        """A redraw is the same line again, not new information."""
        msg = _format_ollama_pull_failure(
            "some:tag",
            1,
            ["pulling manifest ⠋", "pulling manifest ⠙", "pulling manifest ⠹", "boom"],
        )
        self.assertEqual(msg.count("pulling manifest"), 1, msg)
        self.assertNotIn("⠋", msg)


class PartitionPullTagsTests(unittest.TestCase):
    def test_partition_live_registry(self):
        fake_meta = {
            "source": "live",
            "tags": {
                "gemma4:latest": {"exists": True, "size_bytes": 1000},
                "gemma4:4b": {"exists": False, "size_bytes": None},
            },
        }
        with patch(
            "backend.services.ollama_catalog_service.fetch_catalog_metadata",
            return_value=fake_meta,
        ):
            ok, bad = partition_pull_tags_by_registry(["gemma4:latest", "gemma4:4b"])
        self.assertEqual(ok, ["gemma4:latest"])
        self.assertEqual(bad, ["gemma4:4b"])


if __name__ == "__main__":
    unittest.main()
