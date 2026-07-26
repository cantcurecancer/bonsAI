"""Regression: _parse_ask_payload return arity must match Ask RPC unpack sites."""

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


class ParseAskPayloadUnpackTests(unittest.TestCase):
    def test_dict_payload_unpacks_nine_fields(self) -> None:
        payload = {
            "question": "hello",
            "PcIp": "127.0.0.1:11434",
            "appId": "570",
            "appName": "Dota 2",
            "attachments": [],
            "ask_mode": "speed",
            "spoiler_consent": False,
            "reply_followup": {
                "chip_id": "too_long",
                "parent_question": "Why lag?",
                "parent_answer": "CPU bound.",
                "preferred_model": None,
            },
        }
        (
            question,
            pc_ip,
            app_id,
            app_name,
            attachments,
            ask_mode,
            spoiler_consent,
            checklist_state,
            reply_followup,
        ) = Plugin._parse_ask_payload(payload, "")
        self.assertEqual(question, "hello")
        self.assertEqual(pc_ip, "127.0.0.1:11434")
        self.assertEqual(app_id, "570")
        self.assertEqual(reply_followup["chip_id"], "too_long")


if __name__ == "__main__":
    unittest.main()
