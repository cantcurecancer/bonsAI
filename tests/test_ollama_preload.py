"""Boot-time Ask model warm-up (roadmap: Speed-mode VRAM preload, developer switch first).

Covers the pure helpers in ``backend.services.ollama_service`` that decide *which* installed
model is small enough to warm and *whether* the warm-up call went out at all. The switch itself
defaults off; on-boot wiring in ``main.Plugin`` is covered separately.
"""

import io
import json
import unittest
import urllib.error
from unittest.mock import MagicMock, patch

from backend.services.ollama_service import (
    PRELOAD_MAX_PARAMETER_BILLIONS,
    parse_parameter_size_billions,
    pick_preload_model,
    preload_ask_model_sync,
)


class _Logger:
    def __init__(self) -> None:
        self.infos: list[str] = []

    def info(self, msg, *args, **kwargs):
        self.infos.append(msg % args if args else msg)

    def warning(self, *args, **kwargs):
        pass

    def exception(self, *args, **kwargs):
        pass


def _http_error(body: str, code: int = 500) -> urllib.error.HTTPError:
    return urllib.error.HTTPError(
        url="http://127.0.0.1:11434/api/generate",
        code=code,
        msg="Server Error",
        hdrs=None,  # type: ignore[arg-type]
        fp=io.BytesIO(body.encode("utf-8")),
    )


class _Resp:
    def __init__(self, payload: bytes):
        self._payload = payload

    def read(self, n: int = -1):
        return self._payload

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class ParseParameterSizeBillionsTests(unittest.TestCase):
    def test_parses_billions(self):
        self.assertEqual(parse_parameter_size_billions("3.8B"), 3.8)

    def test_parses_millions_as_fraction_of_a_billion(self):
        self.assertAlmostEqual(parse_parameter_size_billions("893M"), 0.893)

    def test_case_insensitive_and_whitespace_tolerant(self):
        self.assertEqual(parse_parameter_size_billions(" 7b "), 7.0)

    def test_non_string_is_unknown(self):
        self.assertIsNone(parse_parameter_size_billions(None))
        self.assertIsNone(parse_parameter_size_billions(7))

    def test_unrecognised_shape_is_unknown_not_guessed(self):
        self.assertIsNone(parse_parameter_size_billions("large"))
        self.assertIsNone(parse_parameter_size_billions(""))


class PickPreloadModelTests(unittest.TestCase):
    def test_picks_first_model_at_or_under_the_cap(self):
        models = [
            {"name": "qwen2.5:32b", "details": {"parameter_size": "32B"}},
            {"name": "qwen2.5:3b", "details": {"parameter_size": "3B"}},
            {"name": "gemma3:1b", "details": {"parameter_size": "1B"}},
        ]
        self.assertEqual(pick_preload_model(models), "qwen2.5:3b")

    def test_exactly_at_the_cap_is_eligible(self):
        models = [{"name": "x:3b", "details": {"parameter_size": f"{PRELOAD_MAX_PARAMETER_BILLIONS}B"}}]
        self.assertEqual(pick_preload_model(models), "x:3b")

    def test_no_eligible_model_returns_none(self):
        models = [{"name": "big:32b", "details": {"parameter_size": "32B"}}]
        self.assertIsNone(pick_preload_model(models))

    def test_missing_or_unparsable_size_is_skipped_not_guessed(self):
        models = [
            {"name": "mystery:latest", "details": {}},
            {"name": "also-mystery", "details": {"parameter_size": "huge"}},
            {"name": "small:3b", "details": {"parameter_size": "3B"}},
        ]
        self.assertEqual(pick_preload_model(models), "small:3b")

    def test_empty_or_malformed_input_returns_none(self):
        self.assertIsNone(pick_preload_model(None))
        self.assertIsNone(pick_preload_model([]))
        self.assertIsNone(pick_preload_model("not-a-list"))


class PreloadAskModelSyncTests(unittest.TestCase):
    @patch("backend.services.ollama_service.urllib.request.urlopen")
    def test_warms_the_first_eligible_small_model(self, mock_urlopen: MagicMock) -> None:
        tags_body = json.dumps(
            {
                "models": [
                    {"name": "qwen2.5:32b", "details": {"parameter_size": "32B"}},
                    {"name": "qwen2.5:3b", "details": {"parameter_size": "3B"}},
                ]
            }
        ).encode("utf-8")
        mock_urlopen.side_effect = [_Resp(tags_body), _Resp(b"{}")]

        preload_ask_model_sync("http://127.0.0.1:11434", _Logger())

        self.assertEqual(mock_urlopen.call_count, 2)
        tags_req = mock_urlopen.call_args_list[0].args[0]
        gen_req = mock_urlopen.call_args_list[1].args[0]
        self.assertIn("/api/tags", tags_req.full_url)
        self.assertIn("/api/generate", gen_req.full_url)
        sent_body = json.loads(gen_req.data.decode("utf-8"))
        self.assertEqual(sent_body["model"], "qwen2.5:3b")
        self.assertEqual(sent_body["prompt"], "")

    @patch("backend.services.ollama_service.urllib.request.urlopen")
    def test_no_eligible_model_skips_without_a_warm_request(self, mock_urlopen: MagicMock) -> None:
        tags_body = json.dumps(
            {"models": [{"name": "qwen2.5:32b", "details": {"parameter_size": "32B"}}]}
        ).encode("utf-8")
        mock_urlopen.return_value = _Resp(tags_body)

        preload_ask_model_sync("http://127.0.0.1:11434", _Logger())

        self.assertEqual(mock_urlopen.call_count, 1)

    @patch("backend.services.ollama_service.urllib.request.urlopen")
    def test_unreachable_host_is_swallowed_silently(self, mock_urlopen: MagicMock) -> None:
        mock_urlopen.side_effect = urllib.error.URLError("connection refused")

        # Must not raise -- an unreachable host at boot is exactly the case this has to be quiet about.
        preload_ask_model_sync("http://127.0.0.1:11434", _Logger())

    @patch("backend.services.ollama_service.urllib.request.urlopen")
    def test_vram_pressure_on_the_warm_request_is_swallowed_silently(
        self, mock_urlopen: MagicMock
    ) -> None:
        tags_body = json.dumps(
            {"models": [{"name": "qwen2.5:3b", "details": {"parameter_size": "3B"}}]}
        ).encode("utf-8")
        mock_urlopen.side_effect = [
            _Resp(tags_body),
            _http_error('{"error":"model requires more system memory than is available"}'),
        ]

        # Must not raise -- memory pressure at boot is the headline case in the roadmap entry.
        preload_ask_model_sync("http://127.0.0.1:11434", _Logger())

    @patch("backend.services.ollama_service.urllib.request.urlopen")
    def test_malformed_tags_response_is_swallowed_silently(self, mock_urlopen: MagicMock) -> None:
        mock_urlopen.return_value = _Resp(b"not json")

        preload_ask_model_sync("http://127.0.0.1:11434", _Logger())


if __name__ == "__main__":
    unittest.main()
