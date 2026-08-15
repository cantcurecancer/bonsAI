"""cancel_rag_corpus_download must not orphan the running task's state reference.

start_rag_corpus_download hands run_rag_corpus_download the *object* behind
self._rag_corpus_download_state, and the task keeps writing progress/phase to that exact
object for as long as it runs. If cancel_rag_corpus_download ever rebinds the attribute to a
new dict (instead of mutating the existing one), every write the task makes afterwards —
phase -> "cancelled", done -> True, error — lands on an object nothing else can see, and a
status poll would show "running" forever.
"""

import asyncio
import sys
import types
import unittest

if "fcntl" not in sys.modules:
    _fcntl = types.ModuleType("fcntl")
    _fcntl.LOCK_EX = 2
    _fcntl.LOCK_NB = 4
    _fcntl.LOCK_UN = 8
    _fcntl.flock = lambda *_a, **_k: False
    sys.modules["fcntl"] = _fcntl

if "decky" not in sys.modules:
    _decky = types.ModuleType("decky")
    _decky.DECKY_PLUGIN_SETTINGS_DIR = "/tmp"
    _decky.logger = types.SimpleNamespace(
        info=lambda *a, **k: None,
        warning=lambda *a, **k: None,
        error=lambda *a, **k: None,
        exception=lambda *a, **k: None,
    )
    sys.modules["decky"] = _decky

from main import Plugin  # noqa: E402


class RagCorpusCancelStateIdentityTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.plugin = Plugin()
        self.plugin._rag_corpus_download_state = {
            "phase": "running",
            "done": False,
            "cancel_requested": False,
            "error": "",
        }
        self.plugin._rag_corpus_cancel_event = asyncio.Event()
        # The reference a running task would have been handed by start_rag_corpus_download's
        # runner() — captured *before* cancel, exactly as the real task does.
        self.state_ref_held_by_task = self.plugin._rag_corpus_download_state

    async def test_cancel_does_not_replace_the_state_object(self) -> None:
        await self.plugin.cancel_rag_corpus_download()
        self.assertIs(
            self.plugin._rag_corpus_download_state,
            self.state_ref_held_by_task,
            "cancel_rag_corpus_download rebound the attribute to a new dict — the running "
            "task's reference is now orphaned and its writes will be invisible.",
        )

    async def test_cancel_event_is_set(self) -> None:
        await self.plugin.cancel_rag_corpus_download()
        self.assertTrue(self.plugin._rag_corpus_cancel_event.is_set())

    async def test_task_writes_after_cancel_are_visible_through_the_attribute(self) -> None:
        """Simulates run_rag_corpus_download's own exception handler finishing the job."""
        await self.plugin.cancel_rag_corpus_download()
        # The task, still holding its original reference, reacts to the cancel event and
        # finishes — exactly what rag_corpus_download_service.run_rag_corpus_download does.
        self.state_ref_held_by_task["phase"] = "cancelled"
        self.state_ref_held_by_task["done"] = True
        self.assertEqual(self.plugin._rag_corpus_download_state.get("phase"), "cancelled")
        self.assertTrue(self.plugin._rag_corpus_download_state.get("done"))

    async def test_cancel_requested_flag_is_set_on_the_live_object(self) -> None:
        await self.plugin.cancel_rag_corpus_download()
        self.assertTrue(self.plugin._rag_corpus_download_state.get("cancel_requested"))


if __name__ == "__main__":
    unittest.main()
