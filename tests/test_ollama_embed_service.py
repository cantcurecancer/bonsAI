import json
import unittest
from unittest import mock

from backend.services.ollama_embed_service import (
    OllamaEmbedError,
    embed_texts,
    nomic_embed_available,
)


class OllamaEmbedServiceTests(unittest.TestCase):
    def test_nomic_embed_available_matches_tag(self):
        with mock.patch(
            "backend.services.ollama_embed_service.list_installed_ollama_tags",
            return_value=["llama3.2", "nomic-embed-text:latest"],
        ):
            self.assertTrue(nomic_embed_available("127.0.0.1:11434"))

    def test_nomic_embed_available_missing(self):
        with mock.patch(
            "backend.services.ollama_embed_service.list_installed_ollama_tags",
            return_value=["llama3.2"],
        ):
            self.assertFalse(nomic_embed_available("127.0.0.1:11434"))

    def test_embed_texts_parses_response(self):
        payload = {"embeddings": [[0.1, 0.2, 0.3]]}

        class FakeResp:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return json.dumps(payload).encode("utf-8")

        with mock.patch("urllib.request.urlopen", return_value=FakeResp()):
            vectors = embed_texts("127.0.0.1:11434", ["hello"])
        self.assertEqual(vectors, [[0.1, 0.2, 0.3]])

    def test_embed_texts_raises_on_bad_payload(self):
        class FakeResp:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return json.dumps({"embeddings": []}).encode("utf-8")

        with mock.patch("urllib.request.urlopen", return_value=FakeResp()):
            with self.assertRaises(OllamaEmbedError):
                embed_texts("127.0.0.1:11434", ["hello"])


if __name__ == "__main__":
    unittest.main()
