"""Concurrent voice starts must not leave orphaned capture sessions."""

import asyncio
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

if "fcntl" not in sys.modules:
    _fcntl = types.ModuleType("fcntl")
    _fcntl.LOCK_EX = 2
    _fcntl.LOCK_NB = 4
    _fcntl.LOCK_UN = 8
    _fcntl.flock = lambda *_a, **_k: False
    sys.modules["fcntl"] = _fcntl

if "decky" not in sys.modules:
    _decky = types.ModuleType("decky")
    _decky.DECKY_PLUGIN_SETTINGS_DIR = "/tmp/bonsai-settings"
    _decky.DECKY_PLUGIN_RUNTIME_DIR = "/tmp/bonsai-runtime"
    _decky.DECKY_PLUGIN_LOG_DIR = "/tmp/bonsai-logs"
    _decky.logger = types.SimpleNamespace(
        info=lambda *a, **k: None,
        warning=lambda *a, **k: None,
        error=lambda *a, **k: None,
        exception=lambda *a, **k: None,
    )
    sys.modules["decky"] = _decky

from main import Plugin  # noqa: E402


class VoiceStartSupersededTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.plugin = Plugin()

    @patch("main.engine_readiness")
    @patch("main.capability_enabled", return_value=True)
    @patch("main.VoiceTranscriptionSession")
    async def test_concurrent_starts_leave_single_session(
        self,
        session_cls: MagicMock,
        _cap: MagicMock,
        readiness: MagicMock,
    ) -> None:
        readiness.return_value = {"binary_ready": True, "model_ready": True}

        created: list[MagicMock] = []
        release_force_stop = asyncio.Event()

        stale = MagicMock()
        stale.status.return_value = {"recording": False, "status": "stopped"}

        def slow_force_stop() -> None:
            # Simulate blocking teardown while a second start RPC races in.
            import time

            while not release_force_stop.is_set():
                time.sleep(0.01)

        stale.force_stop.side_effect = slow_force_stop
        self.plugin._voice_session = stale

        def make_session(*_a, **_k):
            inst = MagicMock()
            inst.start.return_value = {"accepted": True}
            created.append(inst)
            return inst

        session_cls.side_effect = make_session

        async def fake_load_settings() -> dict:
            return {"capabilities": {"microphone_access": True}, "voice_stt_model": "tiny.en"}

        self.plugin.load_settings = fake_load_settings  # type: ignore[method-assign]

        first = asyncio.create_task(self.plugin.start_voice_transcription())
        await asyncio.sleep(0.05)
        second = await self.plugin.start_voice_transcription()
        release_force_stop.set()
        first_out = await first

        self.assertFalse(first_out.get("accepted"))
        self.assertEqual(first_out.get("error"), "busy")
        self.assertTrue(second.get("accepted"))
        self.assertEqual(len(created), 1)
        self.assertIs(self.plugin._voice_session, created[0])


if __name__ == "__main__":
    unittest.main()
