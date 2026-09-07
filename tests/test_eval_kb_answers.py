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
import tempfile
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
            window_warning=False,
            prompt_tokens_est=None,
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

    # --- commit 4: settings writer flags (--voice, --think) ------------------------------------

    def test_write_harness_settings_default_run_has_no_voice_and_thinking_off(self):
        mod = self.mod
        with tempfile.TemporaryDirectory() as tmp:
            settings_dir = Path(tmp)
            path = mod.write_harness_settings(
                settings_dir, corpus_dir=Path(tmp), corpus_version="1", model="m"
            )
            payload = json.loads(path.read_text(encoding="utf-8"))
        self.assertFalse(payload["ai_character_enabled"])
        self.assertNotIn("ai_character_preset_id", payload)
        self.assertEqual(payload["ask_think_effort"], "off")

    def test_write_harness_settings_voice_enables_character_and_records_preset(self):
        mod = self.mod
        with tempfile.TemporaryDirectory() as tmp:
            settings_dir = Path(tmp)
            path = mod.write_harness_settings(
                settings_dir,
                corpus_dir=Path(tmp),
                corpus_version="1",
                model="m",
                voice_preset_id="alig_ali_g",
            )
            payload = json.loads(path.read_text(encoding="utf-8"))
        self.assertTrue(payload["ai_character_enabled"])
        self.assertEqual(payload["ai_character_preset_id"], "alig_ali_g")

    def test_write_harness_settings_rejects_unknown_voice_preset(self):
        mod = self.mod
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                mod.write_harness_settings(
                    Path(tmp),
                    corpus_dir=Path(tmp),
                    corpus_version="1",
                    model="m",
                    voice_preset_id="not_a_real_preset",
                )

    def test_write_harness_settings_think_effort_writes_ask_think_effort(self):
        mod = self.mod
        with tempfile.TemporaryDirectory() as tmp:
            path = mod.write_harness_settings(
                Path(tmp), corpus_dir=Path(tmp), corpus_version="1", model="m", think_effort="medium"
            )
            payload = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(payload["ask_think_effort"], "medium")

    # --- commit 4: kb-placement wrapper (same monkeypatch shape as the variant hook) -----------

    def test_build_prompt_wrapper_forwards_kb_placement_kwarg(self):
        mod = self.mod
        calls = []

        def fake_real_build(*a, **kw):
            calls.append(kw)
            return "PROMPT"

        wrapped = mod._build_prompt_wrapper(fake_real_build, kb_placement="late", variant_fn=None)
        out = wrapped(question="hi")
        self.assertEqual(out, "PROMPT")
        self.assertEqual(calls[-1].get("knowledge_block_placement"), "late")

    def test_build_prompt_wrapper_early_does_not_pass_the_kwarg(self):
        """Early is the shipped default; the wrapper should not force a kwarg the function
        already defaults to, so a real_build that predates the parameter still works."""
        mod = self.mod
        calls = []

        def fake_real_build(*a, **kw):
            calls.append(kw)
            return "PROMPT"

        wrapped = mod._build_prompt_wrapper(fake_real_build, kb_placement="early", variant_fn=None)
        wrapped(question="hi")
        self.assertNotIn("knowledge_block_placement", calls[-1])

    def test_build_prompt_wrapper_applies_variant_after_placement(self):
        mod = self.mod

        def fake_real_build(*a, **kw):
            return "PROMPT with the fence sentence"

        def drop_fence(text: str) -> str:
            return text.replace(" with the fence sentence", "")

        wrapped = mod._build_prompt_wrapper(fake_real_build, kb_placement="late", variant_fn=drop_fence)
        self.assertEqual(wrapped(question="hi"), "PROMPT")

    # --- commit 4: window-warning columns --------------------------------------------------------

    def test_extract_window_warning_reads_the_estimate_out_of_the_log_line(self):
        mod = self.mod
        lines = [
            "[INFO]: ask_ollama: POST http://x model=m payload_bytes=100 num_predict=800 think=False",
            "[WARNING]: ask_ollama: prompt ~2800 tokens + num_predict 2112 = 4912 exceeds the "
            "assumed 4096-token window by ~816; Ollama keeps the end of the prompt and drops its "
            "start silently (identity, rules, cards). Trim what is attached (D46).",
        ]
        warned, tokens = mod._extract_window_warning(lines)
        self.assertTrue(warned)
        self.assertEqual(tokens, 2800)

    def test_extract_window_warning_false_when_nothing_fired(self):
        mod = self.mod
        lines = ["[INFO]: ask_ollama: POST http://x model=m payload_bytes=100 num_predict=800 think=False"]
        warned, tokens = mod._extract_window_warning(lines)
        self.assertFalse(warned)
        self.assertIsNone(tokens)

    def test_window_warning_count_and_mean_prompt_tokens(self):
        samples = [
            self._sample(window_warning=True, prompt_tokens_est=2800),
            self._sample(window_warning=False, prompt_tokens_est=1200),
            self._sample(window_warning=True, prompt_tokens_est=3000),
        ]
        warned, total = self.mod.window_warning_count(samples)
        self.assertEqual((warned, total), (2, 3))
        self.assertAlmostEqual(self.mod.mean_prompt_tokens(samples), 2333.3, places=1)


class EvalKbAnswersAnswerFirstVariantTests(unittest.TestCase):
    """Plan 48, Lane D: the ``answer_first`` prompt-variant hook. Measures nothing itself -- it
    only proves the swap fires on the turn shape it is meant for and stays out of the way of every
    other turn shape, the same way the two spoiler-fence variants above it are proven."""

    _KB_BLOCK = (
        "--- Local knowledge base (bonsAI; offline corpus; may be truncated) ---\n"
        "Domain: strategy\n\n"
        "[Half-Life 2 / boss: Nova Prospekt] (trust: high)\n"
        "Some tactics text here.\n"
        "--- end of knowledge base ---"
    )

    @classmethod
    def setUpClass(cls):
        cls.mod = _load_eval_module()
        from backend.services.ollama_prompts import build_system_prompt

        cls.build_system_prompt = staticmethod(build_system_prompt)

    @classmethod
    def tearDownClass(cls):
        sys.modules.pop("eval_kb_answers", None)

    def _strategy_prompt(self, *, entity: str = "", early_context_suffix: str = ""):
        return self.build_system_prompt(
            "how do i beat the strider",
            "220",
            "Half-Life 2",
            [],
            [],
            lambda app_id: "",
            lambda path: {},
            ask_mode="strategy",
            early_context_suffix=early_context_suffix,
            strategy_spoiler_asked_entity=entity,
            strategy_spoiler_kb_entity_match=bool(entity),
        )

    def test_swaps_the_orientation_sentence_on_a_strategy_turn_with_a_named_thing_and_a_note(self):
        prompt = self._strategy_prompt(entity="the strider", early_context_suffix=self._KB_BLOCK)
        # Sanity: both conditions the variant looks for are actually present in the built prompt.
        self.assertIn("NAMED-ENTITY CONSENT", prompt)
        self.assertIn("Local knowledge base", prompt)
        self.assertIn(self.mod._ORIENTATION_MENU_SENTENCE, prompt)

        out = self.mod._variant_answer_first(prompt)

        self.assertNotEqual(out, prompt)
        self.assertNotIn(self.mod._ORIENTATION_MENU_SENTENCE, out)
        self.assertIn(self.mod._ANSWER_FIRST_SENTENCE, out)
        # The rest of the turn (the menu fence, the spoiler policy line) is untouched.
        self.assertIn("```bonsai-strategy-branches", out)
        self.assertIn("NAMED-ENTITY CONSENT", out)

    def test_leaves_a_speed_turn_untouched(self):
        prompt = self.build_system_prompt(
            "how do i beat the strider",
            "220",
            "Half-Life 2",
            [],
            [],
            lambda app_id: "",
            lambda path: {},
            ask_mode="speed",
            early_context_suffix=self._KB_BLOCK,
        )
        out = self.mod._variant_answer_first(prompt)
        self.assertEqual(out, prompt)

    def test_leaves_a_strategy_turn_untouched_when_no_note_is_attached(self):
        prompt = self._strategy_prompt(entity="the strider", early_context_suffix="")
        self.assertIn(self.mod._ORIENTATION_MENU_SENTENCE, prompt)
        out = self.mod._variant_answer_first(prompt)
        self.assertEqual(out, prompt)

    def test_leaves_a_strategy_turn_untouched_when_nothing_was_named(self):
        prompt = self._strategy_prompt(entity="", early_context_suffix=self._KB_BLOCK)
        self.assertIn(self.mod._ORIENTATION_MENU_SENTENCE, prompt)
        out = self.mod._variant_answer_first(prompt)
        self.assertEqual(out, prompt)

    def test_registered_in_the_variant_table(self):
        self.assertIn("answer_first", self.mod.VARIANTS)
        self.assertIs(self.mod.VARIANTS["answer_first"], self.mod._variant_answer_first)


if __name__ == "__main__":
    unittest.main()
