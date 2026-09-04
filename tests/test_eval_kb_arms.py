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

    def _multi_table(self, **hits_by_arm):
        """Same as `_table`, but for any number of arms -- the shape production actually runs
        (keyword, vector_only, rrf_rerank_only, rrf all at once), not just the rrf/keyword pair."""
        mod = self.mod
        make = lambda hits: [  # noqa: E731 - a local shorthand, not an abstraction
            mod.QueryResult(case_id=str(i), hit_at_1=h, hit_at_3=h, fts_empty=False, embed_ms=0.0)
            for i, h in enumerate(hits)
        ]
        return mod._arms_table({arm: make(hits) for arm, hits in hits_by_arm.items()})

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
        self.assertIn("holdout split has no labeled cases", self.mod._arms_verdict(table))

    def test_verdict_names_vector_only_when_it_leads_and_clears_every_other_arm(self):
        """The exact shape of the 2026-08-29 bug: a third (and fourth) arm the old code never
        looked at, since it only ever compared `rrf` against `keyword`."""
        table = self._multi_table(
            keyword=[False] * 20,
            vector_only=[True] * 20,
            rrf_rerank_only=[False] * 20,
            rrf=[False] * 20,
        )
        verdict = self.mod._arms_verdict(table)
        self.assertIn("Vector-only beats", verdict)
        self.assertIn("keyword", verdict)
        self.assertIn("RRF-rerank-only", verdict)
        self.assertNotIn("No separation", verdict)

    def test_verdict_still_calls_it_no_separation_when_vector_only_leads_but_overlaps_one_arm(
        self,
    ):
        """Leading on point estimate is not the same as clearing every arm's interval. Reuses the
        exact 90%-vs-95%-of-20 pairing `test_verdict_calls_an_overlap_an_overlap` already proved
        overlaps, so this is the same rule applied with two extra arms in the table."""
        table = self._multi_table(
            keyword=[True] * 18 + [False] * 2,  # 90%
            vector_only=[True] * 19 + [False] * 1,  # 95%, best point estimate on the table
            rrf_rerank_only=[False] * 20,
            rrf=[False] * 20,
        )
        verdict = self.mod._arms_verdict(table)
        self.assertIn("No separation", verdict)
        self.assertIn("vector-only", verdict)
        self.assertNotIn("Vector-only beats keyword", verdict)
        # Still reports the arms it does clear, rather than going silent on them.
        self.assertIn("RRF-rerank-only", verdict)

    def test_verdict_names_every_arm_it_judged(self):
        """At minimum, the text must say which arms it judged -- true for a clean sweep and for
        an overlap alike."""
        clean = self.mod._arms_verdict(
            self._multi_table(
                keyword=[False] * 10,
                vector_only=[True] * 10,
                rrf_rerank_only=[False] * 10,
                rrf=[False] * 10,
            )
        )
        self.assertIn("Arms judged:", clean)
        for label in ("keyword", "vector-only", "RRF-rerank-only", "RRF"):
            self.assertIn(label, clean)

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

        # PARA-C01 verbatim. This used to be the demonstration of the Q8 gap -- a
        # plain-English restatement that the phrase list did not match, one of 15 such
        # misses out of 18. Decision D16 added the topic router and it reaches compat now.
        # Kept as a regression pin: if the router is weakened, this goes back to unreachable.
        reachable, domain = self.mod._gate_verdict(
            ask_mode="speed",
            question="linux game keeps closing right after launch compatibility layer",
            app_id="",
            app_name="",
        )
        self.assertTrue(reachable)
        self.assertEqual(domain, "compat")

        # Still unreachable, and correctly so: a strategy question is not troubleshooting.
        reachable, domain = self.mod._gate_verdict(
            ask_mode="speed",
            question="the big lizard in the cave rolls into a ball and I cannot hurt it",
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

    def test_drafted_intents_do_not_echo_the_cards_they_will_match(self):
        """R1's sign-off checklist item, as a test rather than a manual read.

        Each intent carries the phrases its eventual card title will use. If a query
        contains one verbatim, the eval would be measuring "can we find the card we wrote the
        query from" -- the exact inflation R1 exists to prevent. Adding a card whose title
        leaks into its own query must fail here, not pass review.
        """
        path = REPO_ROOT / "tests" / "fixtures" / "kb_eval_v2.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        leaks = []
        for row in data["queries"]:
            normalized = re.sub(r"[^a-z0-9 ]+", " ", row["query"].lower())
            haystack = f" {' '.join(normalized.split())} "
            for banned in row.get("withheld_card_terms", []):
                if f" {banned.lower()} " in haystack:
                    leaks.append((row["id"], banned))
        self.assertEqual(leaks, [], f"queries echo their target card title: {leaks}")

    def test_every_label_names_a_card_that_exists(self):
        """A label may only be written once its card is written.

        This started life as "no labels at all until sign-off". That was the right rule while
        no cards existed, and became wrong when 6d began carding titles one at a time --
        Portal 2 and Half-Life 2 have cards and labels; the other eleven have neither. The
        rule worth keeping is the one underneath it: **a label must name a real card**. A
        label written from imagination turns the eval into a measure of our expectations
        rather than of retrieval, which is the same self-referential trap as R1.
        """
        data = json.loads(
            (REPO_ROOT / "tests" / "fixtures" / "kb_eval_v2.json").read_text(encoding="utf-8")
        )
        seed = json.loads(
            (REPO_ROOT / "data" / "kb" / "strategy_seed.json").read_text(encoding="utf-8")
        )
        card_names = {s["name"] for s in seed["sections"]}
        phantom = [
            (r["id"], r["expect_section"])
            for r in data["queries"]
            if r.get("expect_section") and r["expect_section"] not in card_names
        ]
        self.assertEqual(phantom, [], f"labels naming no card in the seed: {phantom}")

    def test_fixture_status_tracks_whether_every_title_is_carded(self):
        """Unsigned while any title lacks cards; approved once the 13-title seed is complete."""
        data = json.loads(
            (REPO_ROOT / "tests" / "fixtures" / "kb_eval_v2.json").read_text(encoding="utf-8")
        )
        seed = json.loads(
            (REPO_ROOT / "data" / "kb" / "strategy_seed.json").read_text(encoding="utf-8")
        )
        carded = {s["game_id"] for s in seed["sections"]}
        uncarded = [g["canonical_title"] for g in seed["games"] if g["game_id"] not in carded]
        if uncarded:
            self.assertEqual(
                data["status"],
                "awaiting_maintainer_signoff",
                f"fixture claims sign-off while these titles have no cards: {uncarded}",
            )
        else:
            self.assertEqual(
                data["status"],
                "approved_for_rebuild_and_bakeoff",
                "every title is carded — fixture must be approved before PR2 bake-off",
            )

    def test_v2_fixture_has_tune_and_holdout_labeled_cases(self):
        cases = self.mod._load_fixture(
            REPO_ROOT / "tests" / "fixtures" / "kb_eval_v2.json", "kb_eval_v2"
        )
        labeled = [c for c in cases if self.mod._case_is_labeled(c)]
        self.assertTrue(any(c.split == "tune" for c in labeled))
        self.assertTrue(any(c.split == "holdout" for c in labeled))

    def _rows(self, spec):
        """spec: list of (hit, fts_empty) -> QueryResult rows."""
        mod = self.mod
        return [
            mod.QueryResult(
                case_id=str(i), hit_at_1=hit, hit_at_3=hit, fts_empty=empty, embed_ms=0.0
            )
            for i, (hit, empty) in enumerate(spec)
        ]

    def test_keyword_blind_slice_keeps_only_the_cases_keyword_could_not_answer(self):
        """The slice that would have caught the 2026-08-17 recall bug.

        Until the vector half got its own recall pass, every fusion arm scored zero on exactly
        these cases -- and the overall tables barely moved, because keyword search answers most
        labeled questions on its own.
        """
        results = {
            #                    case0          case1         case2
            "keyword": self._rows([(True, False), (False, True), (False, True)]),
            "rrf": self._rows([(True, False), (True, False), (False, False)]),
        }
        blind = self.mod._keyword_blind_slice(results)
        self.assertEqual([r.case_id for r in blind["keyword"]], ["1", "2"])
        self.assertEqual([r.case_id for r in blind["rrf"]], ["1", "2"])
        self.assertEqual([r.hit_at_3 for r in blind["rrf"]], [True, False])

    def test_keyword_blind_slice_reads_the_keyword_arm_not_each_arm(self):
        """Every arm must be scored on the same cases, or the columns are not comparable."""
        results = {
            "keyword": self._rows([(False, True), (True, False)]),
            # This arm found candidates on case 0 and none on case 1 -- irrelevant to the slice.
            "rrf": self._rows([(True, False), (True, True)]),
        }
        blind = self.mod._keyword_blind_slice(results)
        self.assertEqual([r.case_id for r in blind["keyword"]], ["0"])
        self.assertEqual([r.case_id for r in blind["rrf"]], ["0"])

    def test_keyword_blind_slice_is_empty_when_keyword_always_found_something(self):
        results = {"keyword": self._rows([(True, False), (False, False)])}
        self.assertEqual(self.mod._keyword_blind_slice(results)["keyword"], [])

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
