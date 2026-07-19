"""get_reply_language_snapshot must await async load_settings."""

import sys
import types
import unittest
from unittest.mock import AsyncMock, patch

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


class ReplyLanguageSnapshotRpcTests(unittest.IsolatedAsyncioTestCase):
    async def test_snapshot_reads_settings_dict(self) -> None:
        plugin = Plugin()
        plugin.load_settings = AsyncMock(return_value={"reply_language": "en"})  # type: ignore[method-assign]

        with patch(
            "main.reply_language_snapshot",
            return_value={"override": "en", "effective": "english", "display_name": "English"},
        ) as snap:
            out = await plugin.get_reply_language_snapshot()

        snap.assert_called_once_with("en")
        self.assertEqual(out["effective"], "english")


if __name__ == "__main__":
    unittest.main()
