"""Chat slot ownership: record-before-launch and request_id map routing."""

import asyncio
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

if "fcntl" not in sys.modules:
    _fcntl = types.ModuleType("fcntl")
    _fcntl.LOCK_EX = 2
    _fcntl.LOCK_NB = 4
    _fcntl.LOCK_UN = 8
    _fcntl.flock = lambda *_a, **_k: False
    sys.modules["fcntl"] = _fcntl

if "decky" not in sys.modules:
    _decky = types.ModuleType("decky")
    _decky.DECKY_PLUGIN_SETTINGS_DIR = "/tmp/bonsai-chat-slot-tests"
    _decky.logger = types.SimpleNamespace(
        info=lambda *a, **k: None,
        warning=lambda *a, **k: None,
        error=lambda *a, **k: None,
        exception=lambda *a, **k: None,
    )
    sys.modules["decky"] = _decky

from backend.services.chat_slot_service import create_slot, load_slot, wipe_all_slots  # noqa: E402
from main import Plugin  # noqa: E402


class ChatSlotOwnershipTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.settings_patcher = patch.object(Plugin, "_chat_slots_settings_dir", return_value=self.tmp)
        self.settings_patcher.start()
        self.plugin = Plugin()
        wipe_all_slots(self.tmp)

    async def asyncTearDown(self) -> None:
        self.settings_patcher.stop()
        import shutil

        shutil.rmtree(self.tmp, ignore_errors=True)

    async def test_user_turn_recorded_before_task_launch(self) -> None:
        slot = create_slot(self.tmp, label="test-slot")
        sid = slot["id"]
        execute_started = asyncio.Event()
        execute_gate = asyncio.Event()

        async def slow_execute(*_args, **_kwargs):
            execute_started.set()
            await execute_gate.wait()
            return {"success": True, "response": "assistant reply", "elapsed_seconds": 0.1}

        with patch.object(Plugin, "_execute_game_ai_request", side_effect=slow_execute):
            with patch.object(Plugin, "load_settings", return_value={}):
                with patch.object(
                    Plugin,
                    "_compose_opening_thinking_blurb",
                    return_value=("Thinking…", None),
                ):
                    ack = await self.plugin.start_background_game_ai(
                        {
                            "question": "hello?",
                            "PcIp": "127.0.0.1:11434",
                            "appId": "",
                            "appName": "",
                            "chat_slot_id": sid,
                        }
                    )
                    self.assertTrue(ack.get("accepted"))
                    request_id = ack.get("request_id")
                    self.assertIsInstance(request_id, int)

                    loaded = load_slot(self.tmp, sid)
                    self.assertIsNotNone(loaded)
                    assert loaded is not None
                    user_turns = [t for t in loaded["turns"] if t.get("role") == "user"]
                    self.assertEqual(len(user_turns), 1)
                    self.assertEqual(user_turns[0]["text"], "hello?")
                    self.assertEqual(self.plugin._chat_slot_by_request.get(request_id), sid)

                    execute_gate.set()
                    if self.plugin._background_task is not None:
                        await self.plugin._background_task

    async def test_assistant_turn_routes_by_request_map(self) -> None:
        slot = create_slot(self.tmp, label="route-me")
        sid = slot["id"]

        async def fast_execute(*_args, **_kwargs):
            return {"success": True, "response": "routed answer", "elapsed_seconds": 0.01}

        with patch.object(Plugin, "_execute_game_ai_request", side_effect=fast_execute):
            with patch.object(Plugin, "load_settings", return_value={}):
                with patch.object(
                    Plugin,
                    "_compose_opening_thinking_blurb",
                    return_value=("Thinking…", None),
                ):
                    ack = await self.plugin.start_background_game_ai(
                        {
                            "question": "xyzzy slot routing test?",
                            "PcIp": "127.0.0.1:11434",
                            "chat_slot_id": sid,
                        }
                    )
                    if self.plugin._background_task is not None:
                        await self.plugin._background_task

        loaded = load_slot(self.tmp, sid)
        self.assertIsNotNone(loaded)
        assert loaded is not None
        assistant_turns = [t for t in loaded["turns"] if t.get("role") == "assistant"]
        self.assertEqual(len(assistant_turns), 1)
        self.assertEqual(assistant_turns[0]["text"], "routed answer")
        self.assertNotIn(ack.get("request_id"), self.plugin._chat_slot_by_request)

    async def test_unknown_request_id_logs_fault(self) -> None:
        self.plugin._background_request_seq = 9999
        self.plugin._background_state = {
            "status": "pending",
            "request_id": 9999,
            "question": "orphan",
            "app_id": "",
            "app_context": "none",
        }

        errors: list[str] = []

        def capture_error(msg, *args):
            errors.append(str(msg) % args if args else str(msg))

        async def fast_execute(*_args, **_kwargs):
            return {"success": True, "response": "orphan answer", "elapsed_seconds": 0.01}

        with patch.object(sys.modules["decky"].logger, "error", side_effect=capture_error):
            with patch.object(Plugin, "_execute_game_ai_request", side_effect=fast_execute):
                await self.plugin._run_background_request(
                    9999,
                    "orphan",
                    "127.0.0.1:11434",
                    "",
                    "",
                )

        joined = " ".join(errors)
        self.assertIn("chat_slots: no slot for request_id=9999", joined)


if __name__ == "__main__":
    unittest.main()
