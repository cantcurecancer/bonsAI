import os
import unittest
from pathlib import Path
from unittest import mock

from backend.services.knowledge_base_schema import (
    corpus_has_usable_compat_vectors,
    corpus_has_usable_section_vectors,
    corpus_has_usable_vectors,
    default_corpus_dir_internal,
    default_corpus_dir_sd,
    is_allowed_corpus_install_path,
    list_rag_storage_options,
    pack_embedding_vector,
    sanitize_corpus_install_dir,
    unpack_embedding_vector,
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


    def test_vector_helpers_roundtrip(self):
        vec = [0.5, -0.25, 0.125]
        self.assertEqual(unpack_embedding_vector(pack_embedding_vector(vec)), vec)

    def test_corpus_has_usable_vectors_false_when_manifest_says_so(self):
        import sqlite3

        conn = sqlite3.connect(":memory:")
        conn.execute(
            "CREATE TABLE section_vectors (section_id INTEGER PRIMARY KEY, embedding BLOB)"
        )
        conn.execute(
            "INSERT INTO section_vectors(section_id, embedding) VALUES (1, ?)",
            (pack_embedding_vector([0.1, 0.2]),),
        )
        self.assertFalse(corpus_has_usable_vectors(conn, {"embeddings_populated": False}))
        self.assertTrue(corpus_has_usable_vectors(conn, {"embeddings_populated": True}))

    def test_corpus_has_usable_compat_vectors(self):
        import sqlite3

        conn = sqlite3.connect(":memory:")
        conn.execute(
            "CREATE TABLE compat_pattern_vectors (pattern_id INTEGER PRIMARY KEY, embedding BLOB)"
        )
        conn.execute(
            "INSERT INTO compat_pattern_vectors(pattern_id, embedding) VALUES (1, ?)",
            (pack_embedding_vector([0.1, 0.2]),),
        )
        self.assertTrue(corpus_has_usable_compat_vectors(conn))
        self.assertTrue(corpus_has_usable_vectors(conn))
        self.assertFalse(corpus_has_usable_section_vectors(conn))


if __name__ == "__main__":
    unittest.main()
