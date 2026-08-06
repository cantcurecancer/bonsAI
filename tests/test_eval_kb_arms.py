"""
Title: Eval harness arm-comparison tests
Purpose: Pin the honesty rules the KB retrieval bake-off enforces in code.
Used for: scripts/eval_kb_embed_models.py — splits, bootstrap CIs, the non-overlap verdict,
          and the live gate-reachability check (R2).
Solves: The eval is what decides whether fusion ships. A verdict that rounds an overlap up to
        a win, or a gate flag that goes stale, would settle the argument with a wrong number.
Does not: Run any embedding or touch Ollama — every test here is pure scoring logic.
"""

import importlib.util
import json
import re
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_eval_module():
    spec = importlib.util.spec_from_file_location(
        "eval_kb_embed_models", REPO_ROOT / "scripts" / "eval_kb_embed_models.py"
    )
    module = importlib.util.module_from_spec(spec)
    # @dataclass resolves annotations through sys.modules, so register before executing.
    sys.modules[spec.name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:  # pragma: no cover - a load failure must not leave a stub behind
        sys.modules.pop(spec.name, None)
        raise
    return module


class EvalArmsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = _load_eval_module()

    @classmethod
    def tearDownClass(cls):
        sys.modules.pop("eval_kb_embed_models", None)

    def _table(self, keyword_hits, rrf_hits):
        """Build the arm table the verdict reads, from raw per-case hit lists."""
        mod = self.mod
        make = lambda hits: [  # noqa: E731 - a local shorthand, not an abstraction
            mod.QueryResult(case_id=str(i), hit_at_1=h, hit_at_3=h, fts_empty=False, embed_ms=0.0)
            for i, h in enumerate(hits)
        ]
        return mod._arms_table({"keyword": make(keyword_hits), "rrf": make(rrf_hits)})

    def test_bootstrap_ci_brackets_the_point_estimate(self):
        hits = [True] * 30 + [False] * 10
        lo, hi = self.mod._bootstrap_ci(hits)
        self.assertLessEqual(lo, 75.0)
        self.assertGreaterEqual(hi, 75.0)

    def test_bootstrap_ci_is_reproducible(self):
        hits = [True, False, True, True, False, True, False, True]
        self.assertEqual(self.mod._bootstrap_ci(hits), self.mod._bootstrap_ci(hits))

    def test_bootstrap_ci_refuses_to_look_confident_on_one_case(self):
        """A one-case slice would otherwise report [100, 100] and read as certainty."""
        self.assertEqual(self.mod._bootstrap_ci([True]), (0.0, 100.0))
        self.assertEqual(self.mod._bootstrap_ci([]), (0.0, 100.0))

    def test_verdict_calls_an_overlap_an_overlap(self):
        """The failure mode worth blocking: a higher point estimate read as a win."""
        table = self._table([True] * 18 + [False] * 2, [True] * 19 + [False])
        verdict = self.mod._arms_verdict(table)
        self.assertIn("No separation", verdict)
        self.assertNotIn("RRF beats", verdict)

    def test_verdict_names_rrf_only_when_intervals_clear(self):
        table = self._table([False] * 40, [True] * 40)
        self.assertIn("RRF beats keyword", self.mod._arms_verdict(table))

    def test_verdict_is_willing_to_say_keyword_won(self):
        """The eval has to be able to return the answer nobody wants."""
        table = self._table([True] * 40, [False] * 40)
        verdict = self.mod._arms_verdict(table)
        self.assertIn("Keyword beats RRF", verdict)
        self.assertIn("not earning its embed cost", verdict)

    def test_empty_holdout_is_reported_as_ungated_not_as_a_tie(self):
        table = self._table([], [])
        self.assertIn("holdout split is empty", self.mod._arms_verdict(table))

    def test_gate_reachability_comes_from_the_live_gate(self):
        """A phrase-list change must move this number, not leave a stale fixture boolean."""
        reachable, domain = self.mod._gate_verdict(
            ask_mode="speed",
            question="proton crash on launch",
            app_id="",
            app_name="",
        )
        self.assertTrue(reachable)
        self.assertEqual(domain, "compat")

        # The deferred Q8 gap, asserted rather than described. This is PARA-C01 verbatim: a
        # plain-English restatement of the case above, which the phrase list does not match.
        # 15 of 18 compat fixtures fail this way, which is why compat is reported twice.
        reachable, domain = self.mod._gate_verdict(
            ask_mode="speed",
            question="linux game keeps closing right after launch compatibility layer",
            app_id="",
            app_name="",
        )
        self.assertFalse(reachable)
        self.assertEqual(domain, "")

    def test_fixture_split_defaults_and_overrides(self):
        cases = self.mod._load_fixture(
            REPO_ROOT / "tests" / "fixtures" / "kb_eval_v0.json", "kb_eval_v0"
        )
        self.assertTrue(cases)
        # Every current case is tune by design (R1); a holdout has to be written blind.
        self.assertEqual({c.split for c in cases}, {"tune"})

    def test_v1_intents_do_not_echo_the_cards_they_will_match(self):
        """R1's sign-off checklist item, as a test rather than a manual read.

        Each v1 intent carries the phrases its eventual card title will use. If a query
        contains one verbatim, the eval would be measuring "can we find the card we wrote the
        query from" -- the exact inflation R1 exists to prevent. Adding a card whose title
        leaks into its own query must fail here, not pass review.
        """
        path = REPO_ROOT / "tests" / "fixtures" / "kb_eval_v1.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        leaks = []
        for row in data["queries"]:
            normalized = re.sub(r"[^a-z0-9 ]+", " ", row["query"].lower())
            haystack = f" {' '.join(normalized.split())} "
            for banned in row.get("ban_verbatim", []):
                if f" {banned.lower()} " in haystack:
                    leaks.append((row["id"], banned))
        self.assertEqual(leaks, [], f"queries echo their target card title: {leaks}")

    def test_v1_intents_are_not_yet_a_scoring_fixture(self):
        """Labels stay empty until cards exist and the maintainer signs off."""
        path = REPO_ROOT / "tests" / "fixtures" / "kb_eval_v1.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(data["status"], "awaiting_maintainer_signoff")
        labelled = [
            r["id"] for r in data["queries"] if r.get("expect_section") or r.get("expect_topic")
        ]
        self.assertEqual(labelled, [], "labels were filled before sign-off")

    def test_slice_keeps_arms_aligned(self):
        mod = self.mod
        cases = [
            mod.QueryCase(
                case_id=str(i),
                query="q",
                ask_mode="speed",
                domain="compat" if i % 2 else "strategy",
                app_id="",
                shortcut="",
                expect_topic="",
                expect_section="",
                suite="t",
            )
            for i in range(6)
        ]
        results = {
            arm: [
                mod.QueryResult(
                    case_id=str(i), hit_at_1=False, hit_at_3=False, fts_empty=False, embed_ms=0.0
                )
                for i in range(6)
            ]
            for arm in ("keyword", "rrf")
        }
        sliced = mod._slice_results(results, cases, lambda c: c.domain == "compat")
        self.assertEqual([r.case_id for r in sliced["keyword"]], ["1", "3", "5"])
        self.assertEqual([r.case_id for r in sliced["rrf"]], ["1", "3", "5"])


if __name__ == "__main__":
    unittest.main()
