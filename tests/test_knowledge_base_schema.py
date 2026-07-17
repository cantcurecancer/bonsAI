import os
import unittest
from pathlib import Path
from unittest import mock

from backend.services.knowledge_base_schema import (
    default_corpus_dir_internal,
    default_corpus_dir_sd,
    is_allowed_corpus_install_path,
    list_rag_storage_options,
    sanitize_corpus_install_dir,
)


class KnowledgeBaseSchemaPathTests(unittest.TestCase):
    def test_default_internal_under_home(self):
        path = default_corpus_dir_internal()
        self.assertTrue(is_allowed_corpus_install_path(Path(path)))

    def test_sanitize_internal_path(self):
        with mock.patch("pathlib.Path.home", return_value=Path("/home/deck")):
            resolved = sanitize_corpus_install_dir("/home/deck/.bonsai/rag")
        self.assertTrue(resolved.replace("\\", "/").endswith("/.bonsai/rag"))

    def test_sd_path_allowed_when_under_run_media(self):
        with mock.patch("pathlib.Path.home", return_value=Path("/home/deck")):
            sd_install = Path("/run/media/deck/SD128/.bonsai/rag")
            self.assertTrue(is_allowed_corpus_install_path(sd_install))

    def test_default_corpus_dir_sd(self):
        path = default_corpus_dir_sd("/run/media/deck/MySD")
        self.assertTrue(str(path).replace("\\", "/").endswith("/run/media/deck/MySD/.bonsai/rag"))

    def test_sanitize_rejects_outside_home_and_sd(self):
        with self.assertRaises(ValueError):
            sanitize_corpus_install_dir("/var/tmp/rag")

    def test_list_storage_options_includes_internal(self):
        opts = list_rag_storage_options()
        self.assertIn("internal", opts)
        self.assertTrue(str(opts["internal"]["install_path"]))

    def test_sanitize_sd_path_under_run_media(self):
        with mock.patch("pathlib.Path.home", return_value=Path("/home/deck")):
            resolved = sanitize_corpus_install_dir("/run/media/deck/SDCARD/.bonsai/rag")
        self.assertTrue(resolved.endswith(os.path.join(".bonsai", "rag")))


if __name__ == "__main__":
    unittest.main()
