"""
Title: KB answer eval harness tests

Purpose: Pin the harness plumbing added for the prompt-diet lane (plan 46, Lane C) that does not
         need a live Ollama: prompt-length reporting, the settings the harness writes for a voice
         or thinking-effort run, the kb-placement wrapper, and the two window-warning columns.
Used for: scripts/eval_kb_answers.py.
Solves: The harness itself has no test coverage, so a flag that silently no-ops (e.g. --voice not
        reaching settings.json) would only be caught by a maintainer reading a report and wondering
        why nothing changed.
Does not: Run the real Ask pipeline or touch Ollama — every test here is pure plumbing / file I/O.
"""

import importlib.util
import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "py_modules"))


def _load_eval_module():
    spec = importlib.util.spec_from_file_location(
        "eval_kb_answers", REPO_ROOT / "scripts" / "eval_kb_answers.py"
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:  # pragma: no cover - a load failure must not leave a stub behind
        sys.modules.pop(spec.name, None)
        raise
    return module


class EvalKbAnswersHarnessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = _load_eval_module()

    @classmethod
    def tearDownClass(cls):
        sys.modules.pop("eval_kb_answers", None)

    def _sample(self, **overrides):
        """A minimal SampleResult; every field the dataclass needs, override what a test cares about."""
        mod = self.mod
        base = dict(
            case_id="c1",
            sample=1,
            success=True,
            elapsed_s=1.0,
            model="m",
            reply="hello",
            kb_attached=True,
            cards=[],
            card_ok=None,
            attached_ok=None,
            mention_hits=[],
            mention_ok=None,
            notsay_hits=[],
            notsay_ok=None,
            fence_present=False,
            fence_ok=None,
            branches_present=False,
            branches_ok=None,
            payload_bytes=None,
            prompt_eval_tokens=None,
            system_prompt_chars=None,
        )
        base.update(overrides)
        return mod.SampleResult(**base)

    # --- commit 1: prompt_chars mean ----------------------------------------------------------

    def test_mean_prompt_chars_averages_only_captured_samples(self):
        samples = [
            self._sample(system_prompt_chars=1000),
            self._sample(system_prompt_chars=2000),
            self._sample(system_prompt_chars=None),  # sample 2+ of a case: no captured prompt
        ]
        self.assertEqual(self.mod.mean_prompt_chars(samples), 1500.0)

    def test_mean_prompt_chars_is_none_with_nothing_captured(self):
        samples = [self._sample(system_prompt_chars=None)]
        self.assertIsNone(self.mod.mean_prompt_chars(samples))


if __name__ == "__main__":
    unittest.main()
