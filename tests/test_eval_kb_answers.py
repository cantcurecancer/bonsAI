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

    # --- plan 48 lane A, commit 1: tolerant fact matching (D86/D88) ----------------------------
    #
    # The old check passed a must_mention alternative only when it appeared as an exact phrase in
    # the reply, so a right answer in different words was scored as a missing fact. These four
    # pairs are the ones the roadmap bug named; the fifth uses the real reply text recorded in
    # docs/archive/research/kb-answer-eval-2026-09-07-after-wave2.md for case A-TTYD-01, which
    # failed both fact groups under the old check ("missing facts: `eats the audience`, `cricket`")
    # even though it plainly states both facts, just in different words.

    def test_fact_group_hit_matches_keep_the_crowd_thin_against_thin_the_crowd(self):
        self.assertTrue(
            self.mod.fact_group_hit("you need to keep the crowd thin", ["thin the crowd"])
        )

    def test_fact_group_hit_matches_killing_the_mother_against_kill_the_mother(self):
        self.assertTrue(
            self.mod.fact_group_hit("killing the mother first is the plan", ["kill the mother"])
        )

    def test_fact_group_hit_matches_hurting_her_badly_against_hurts_her_badly(self):
        self.assertTrue(
            self.mod.fact_group_hit("fire is also noted as hurting her badly", ["fire hurts her badly"])
        )

    def test_fact_group_hit_matches_the_paper_mario_report_reply(self):
        reply = (
            "The key to dealing with Hooktail's healing is managing the audience. She heals by "
            "eating members of the audience, so you need to keep the crowd thin. Also, remember "
            "that her bite cannot be blocked, so focus on keeping your own HP high rather than "
            "trying to guard against her attacks. Koops is useful here because his shell toss hits "
            "her first before you commit Mario. Fire is also noted as hurting her badly."
        )
        group1 = ["eats the audience", "eats spectators to heal", "thin the crowd", "keep the audience small"]
        group2 = ["cricket", "chirping sound", "the badge with the cricket noise", "fire damage", "fire hurts her badly"]
        self.assertTrue(self.mod.fact_group_hit(reply, group1))
        self.assertTrue(self.mod.fact_group_hit(reply, group2))

    def test_fact_group_hit_fails_when_the_words_are_too_far_apart(self):
        # A wrong answer must still fail: "crowd" and "thin" both occur somewhere in this reply,
        # but nowhere near each other -- a check with no window would wrongly pass it.
        reply = (
            "The crowd cheered loudly. "
            + " ".join(["and then something else happened"] * 4)
            + " The paint looked thin."
        )
        self.assertFalse(self.mod.fact_group_hit(reply, ["thin the crowd"]))

    def test_fact_group_hit_fails_when_the_stems_match_but_the_context_does_not(self):
        # Same shape, a different pair of words: "kill" and "mother" both occur, in two unrelated
        # sentences far apart, not describing the claim "kill the mother".
        reply = (
            "You can kill the runt easily. "
            + " ".join(["it takes a few hits to bring down"] * 4)
            + " Her mother taught her everything about the forest."
        )
        self.assertFalse(self.mod.fact_group_hit(reply, ["kill the mother"]))

    # --- plan 48 lane A, commit 2: negation-aware contradiction check (D86/D88) ----------------
    #
    # The old check only caught a contradiction that used one of a fixed list of exact sentences.
    # The Pikmin 2 reply recorded in docs/archive/research/kb-answer-eval-2026-09-07-after-wave2.md
    # for case A-PIK2-02 said "yes, there is still a day limit" -- a plain contradiction of the
    # note, which the old check missed because the fixture's sentence was "there's a day limit"
    # (a different contraction) and "you have a limited number of days" (different words again).

    def test_claim_group_hit_catches_the_pikmin_reply_that_kept_the_day_limit(self):
        reply = (
            "Regarding the day limit, yes, there is still a day limit. The day ends at sunset, "
            "and any Pikmin that is not with a captain or back at the Onion will be eaten when "
            "the night creatures wake up. You need to watch the sun and call everyone in early."
        )
        self.assertTrue(self.mod.claim_group_hit(reply, ["there is a day limit"]))

    def test_claim_group_hit_does_not_fire_when_the_reply_denies_the_claim(self):
        reply = "There is no day limit in Pikmin 2 -- take as long as you need."
        self.assertFalse(self.mod.claim_group_hit(reply, ["there is a day limit"]))

    def test_claim_group_hit_recognises_no_longer_as_a_negation(self):
        reply = "There is no longer a day limit in this game."
        self.assertFalse(self.mod.claim_group_hit(reply, ["there is a day limit"]))

    def test_claim_group_hit_known_miss_not_only_is_there_a_day_limit(self):
        # Named in plan 48 (docs/planning/48-kb-wave-three-session.md, section 10) as a phrasing a
        # negation-aware check on a fixed lookback can be fooled by: "not" sits just before "there"
        # here, so it reads as a negation of the claim even though "not only" does not actually
        # deny that a day limit exists -- the opposite of what the sentence means. Documented as a
        # known miss rather than chased; the judge column (commit 3) is the second opinion for
        # exactly this kind of case.
        reply = "Not only is there a day limit."
        self.assertFalse(self.mod.claim_group_hit(reply, ["there is a day limit"]))

    def test_claim_group_hit_any_alternative_in_the_group_counts(self):
        self.assertTrue(
            self.mod.claim_group_hit(
                "focus one first and ignore the other twin", ["kill one first", "focus one first"]
            )
        )

    # --- plan 48 lane A, commit 2: must_not_say fixture shape --------------------------------

    def test_parse_must_not_say_wraps_the_old_flat_shape_as_one_claim_group(self):
        self.assertEqual(
            self.mod._parse_must_not_say(["training perk", "power armor training"]),
            [["training perk", "power armor training"]],
        )

    def test_parse_must_not_say_keeps_the_new_nested_shape(self):
        self.assertEqual(
            self.mod._parse_must_not_say([["training perk", "power armor training"], ["a second claim"]]),
            [["training perk", "power armor training"], ["a second claim"]],
        )

    def test_parse_must_not_say_empty_is_empty(self):
        self.assertEqual(self.mod._parse_must_not_say([]), [])
        self.assertEqual(self.mod._parse_must_not_say(None), [])


if __name__ == "__main__":
    unittest.main()
