import sys
import unittest
import tempfile
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

from backend.services.plugin_data_reset import (
    PROTON_JOURNAL_FILENAME,
    reset_plugin_disk_and_defaults,
    wipe_proton_experiment_journal,
)
from backend.services.settings_service import load_settings, save_settings, sanitize_settings


class _Logger:
    def warning(self, *args, **kwargs):
        pass

    def exception(self, *args, **kwargs):
        pass


def _sanitize(data):
    return sanitize_settings(
        data,
        default_latency_warning_seconds=60,
        default_request_timeout_seconds=180,
        min_latency_warning_seconds=5,
        max_latency_warning_seconds=300,
        min_request_timeout_seconds=10,
        max_request_timeout_seconds=600,
        valid_persistence_modes={"persist_all", "persist_search_only", "no_persist"},
        default_persistence_mode="no_persist",
        valid_ask_modes={"speed", "strategy", "expert"},
        default_ask_mode="speed",
    )


class PluginDataResetTests(unittest.TestCase):
    def test_reset_removes_old_settings_and_writes_defaults(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            settings_dir = root / "settings"
            settings_dir.mkdir()
            settings_path = str(settings_dir / "settings.json")
            runtime_dir = str(root / "runtime")
            log_dir = str(root / "logs")
            Path(runtime_dir).mkdir()
            Path(log_dir).mkdir()
            (Path(runtime_dir) / "captures").mkdir()
            (Path(runtime_dir) / "captures" / "x.bin").write_bytes(b"x")
            Path(settings_path).write_text(
                '{"latency_warning_seconds": 99, "capabilities": {"filesystem_write": true}}',
                encoding="utf-8",
            )
            (Path(log_dir) / "plugin.log").write_text("x", encoding="utf-8")

            out, settings_removed = reset_plugin_disk_and_defaults(
                settings_path=settings_path,
                settings_dir=str(settings_dir),
                runtime_dir=runtime_dir,
                log_dir=log_dir,
                sanitize_func=_sanitize,
                load_settings=lambda p, s, lg: load_settings(p, s, lg),
                save_settings=save_settings,
                logger=logger,
            )

            self.assertGreaterEqual(settings_removed, 1)
            self.assertEqual(out["latency_warning_seconds"], 60)
            reloaded = load_settings(settings_path, _sanitize, logger)
            self.assertEqual(reloaded["latency_warning_seconds"], 60)
            self.assertFalse(out["capabilities"]["filesystem_write"])
            self.assertTrue(Path(runtime_dir).is_dir())
            self.assertFalse((Path(runtime_dir) / "captures").exists())
            self.assertFalse((Path(log_dir) / "plugin.log").exists())

    def test_reset_wipes_rag_corpus_dir(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            settings_dir = root / "settings"
            settings_dir.mkdir()
            settings_path = str(settings_dir / "settings.json")
            runtime_dir = str(root / "runtime")
            log_dir = str(root / "logs")
            corpus_dir = root / "rag"
            corpus_dir.mkdir()
            (corpus_dir / "corpus.db").write_bytes(b"sqlite")
            (corpus_dir / "manifest.json").write_text("{}", encoding="utf-8")
            Path(runtime_dir).mkdir()
            Path(log_dir).mkdir()
            Path(settings_path).write_text("{}", encoding="utf-8")

            reset_plugin_disk_and_defaults(
                settings_path=settings_path,
                settings_dir=str(settings_dir),
                runtime_dir=runtime_dir,
                log_dir=log_dir,
                sanitize_func=_sanitize,
                load_settings=lambda p, s, lg: load_settings(p, s, lg),
                save_settings=save_settings,
                logger=logger,
                rag_corpus_path=str(corpus_dir),
            )

            self.assertFalse(corpus_dir.exists())

        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            settings_dir = root / "settings"
            settings_dir.mkdir()
            settings_path = str(settings_dir / "settings.json")
            runtime_dir = str(root / "runtime")
            log_dir = str(root / "logs")
            Path(runtime_dir).mkdir()
            Path(log_dir).mkdir()
            (settings_dir / "voice_models").mkdir()
            (settings_dir / "voice_models" / "ggml-tiny.en.bin").write_bytes(b"x")
            (settings_dir / "voice_bin").mkdir()
            (settings_dir / "voice_bin" / "whisper-cli").write_bytes(b"x")
            (settings_dir / "bonsai_feedback.jsonl").write_text('{"rating":"up"}\n', encoding="utf-8")
            Path(settings_path).write_text(
                '{"capabilities": {"filesystem_write": true}}',
                encoding="utf-8",
            )

            out, settings_removed = reset_plugin_disk_and_defaults(
                settings_path=settings_path,
                settings_dir=str(settings_dir),
                runtime_dir=runtime_dir,
                log_dir=log_dir,
                sanitize_func=_sanitize,
                load_settings=lambda p, s, lg: load_settings(p, s, lg),
                save_settings=save_settings,
                logger=logger,
            )

            self.assertGreaterEqual(settings_removed, 4)
            self.assertFalse((settings_dir / "voice_models").exists())
            self.assertFalse((settings_dir / "voice_bin").exists())
            self.assertFalse((settings_dir / "bonsai_feedback.jsonl").exists())
            self.assertTrue(Path(settings_path).is_file())
            self.assertFalse(out["capabilities"]["filesystem_write"])


class ProtonJournalWipeTests(unittest.TestCase):
    """Moved here from test_proton_experiment_journal_service.py with the function itself.

    The wipe is Deck-only, so the platform guard is faked rather than skipped —
    the original test asserted nothing on Windows and so never ran here.
    """

    @contextmanager
    def _deck_home(self, home: Path):
        with patch.object(sys, "platform", "linux"), patch.object(Path, "home", return_value=home):
            yield

    def test_wipe_removes_journal_under_home(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            journal = home / ".bonsai" / PROTON_JOURNAL_FILENAME
            journal.parent.mkdir(parents=True)
            journal.write_text("{}", encoding="utf-8")

            with self._deck_home(home):
                self.assertTrue(wipe_proton_experiment_journal(logger, str(home)))

            self.assertFalse(journal.exists())

    def test_wipe_refuses_paths_outside_home(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp, tempfile.TemporaryDirectory() as other_home:
            home = Path(tmp)
            journal = home / ".bonsai" / PROTON_JOURNAL_FILENAME
            journal.parent.mkdir(parents=True)
            journal.write_text("{}", encoding="utf-8")

            with self._deck_home(Path(other_home)):
                self.assertFalse(wipe_proton_experiment_journal(logger, str(home)))

            self.assertTrue(journal.exists())

    def test_wipe_succeeds_when_no_journal_exists(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            with self._deck_home(home):
                self.assertTrue(wipe_proton_experiment_journal(logger, str(home)))

    def test_wipe_is_a_no_op_on_windows(self):
        logger = _Logger()
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            journal = home / ".bonsai" / PROTON_JOURNAL_FILENAME
            journal.parent.mkdir(parents=True)
            journal.write_text("{}", encoding="utf-8")

            with patch.object(sys, "platform", "win32"):
                self.assertFalse(wipe_proton_experiment_journal(logger, str(home)))

            self.assertTrue(journal.exists())


if __name__ == "__main__":
    unittest.main()
