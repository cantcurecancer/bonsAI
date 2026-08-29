"""
Title: Compat topic router tests
Purpose: Pin what routes an Ask to the shared troubleshooting corpus, and what must not.
Used for: py_modules/backend/services/compat_topic_router.py, decision D16.
Solves: The router trades precision for reach on purpose. That trade is only safe while the
        strategy side stays clean, so the false-positive direction needs a test, not a hope.
Does not: Test ranking or retrieval quality — only the routing decision.
"""

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT / "py_modules") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "py_modules"))

from backend.services.compat_topic_router import (  # noqa: E402
    known_compat_topics,
    match_compat_corpus_topics,
    question_targets_compat_corpus,
)
from backend.services.knowledge_base_service import should_retrieve_knowledge  # noqa: E402


class CompatTopicRouterTests(unittest.TestCase):
    def test_every_corpus_topic_can_be_reached(self):
        """Drift guard. A tip sheet topic with no routing rule is content nobody can retrieve.

        This is the failure D16 was raised for, in miniature: eight anti-cheat tips shipped
        and no question could reach them. Adding a topic to the corpus without a rule here
        must fail a test rather than quietly ship dead cards.
        """
        patterns = json.loads(
            (REPO_ROOT / "data" / "kb" / "compat_patterns.json").read_text(encoding="utf-8")
        )
        corpus_topics = {str(p.get("topic") or "").strip() for p in patterns}
        corpus_topics.discard("")
        missing = sorted(corpus_topics - known_compat_topics())
        self.assertEqual(missing, [], f"corpus topics with no routing rule: {missing}")

    def test_plain_english_troubleshooting_now_routes(self):
        """The D16 headline: none of these reached the compat corpus before."""
        for question in (
            "I'm out of room and want my installs on the memory card instead",
            "the game only responds to the touchpad and ignores the sticks",
            "I can play alone but online kicks me out straight away",
            "my headset disconnects whenever anything else is plugged in",
            "my playstation 2 games run at half speed on the handheld",
            "playing from my desktop over wifi keeps hitching every few seconds",
        ):
            with self.subTest(question=question):
                should_run, domain = should_retrieve_knowledge(
                    use_local_knowledge_base=True,
                    ask_mode="speed",
                    question=question,
                    app_id="",
                    app_name="",
                )
                self.assertTrue(should_run)
                self.assertEqual(domain, "compat")

    def test_strategy_questions_do_not_route_to_troubleshooting(self):
        """Every one of these fired before word-boundary matching went in.

        "lan" matched inside "plants", "plane" and "island"; "motion aim" matched Red Dead's
        slow-motion aiming. A strategy Ask answered with a networking tip is worse than no
        tip at all, so these are pinned by example rather than by rule.
        """
        for question in (
            "the biome with all the sticky plants keeps killing my run",
            "I can't pass the plane lessons in the desert",
            "the tropical island chapter feels like a different game, what do I keep",
            "the slow-motion aiming barely lasts, how do I get more of it",
            "the big lizard in the cave rolls into a ball and I can't hurt it",
            "which god's gifts should I take for a spear run",
        ):
            with self.subTest(question=question):
                self.assertFalse(question_targets_compat_corpus(question))

    def test_a_weak_topic_alone_does_not_route(self):
        """"Deck" and "crash" are ordinary words in a game question."""
        self.assertEqual(match_compat_corpus_topics("how do I beat this boss on my deck"), ["deck"])
        self.assertFalse(question_targets_compat_corpus("how do I beat this boss on my deck"))
        self.assertFalse(question_targets_compat_corpus("the boss crashes into me and I die"))
        # But a weak topic riding alongside a real one is fine.
        self.assertTrue(question_targets_compat_corpus("proton crash on my deck"))

    def test_apostrophes_survive_normalization(self):
        """A rule written as `cant see` has to match a question written `can't see`.

        Spacing the apostrophe instead of dropping it produced `can t see`, which silently
        killed two rules that read as though they worked.
        """
        self.assertTrue(
            question_targets_compat_corpus(
                "the handheld can't see the computer running the model on my home wifi"
            )
        )

    def test_router_is_additive_not_a_replacement(self):
        """The original phrase gate still routes what it always routed."""
        for question in ("why is my game crashing proton issue", "deck sleep resume black screen"):
            with self.subTest(question=question):
                self.assertTrue(
                    should_retrieve_knowledge(
                        use_local_knowledge_base=True,
                        ask_mode="speed",
                        question=question,
                        app_id="",
                        app_name="",
                    )[0]
                )

    def test_knowledge_base_off_still_wins(self):
        should_run, domain = should_retrieve_knowledge(
            use_local_knowledge_base=False,
            ask_mode="speed",
            question="I'm out of room and want my installs on the memory card",
            app_id="",
            app_name="",
        )
        self.assertFalse(should_run)
        self.assertEqual(domain, "")

    def test_empty_and_junk_questions_route_nowhere(self):
        for question in ("", "   ", "!!!", "hello"):
            with self.subTest(question=question):
                self.assertFalse(question_targets_compat_corpus(question))

    def test_measured_reach_on_the_drafted_intents(self):
        """The number D16 was decided on, pinned so a rule edit cannot quietly undo it.

        Holdout compat intents were not read while the rules were written — they are the
        blind check. Three cases are known misses and are named here rather than patched
        for, all the same shape: a symptom described without naming any troubleshooting
        term. V2-C-04 sits in tune; V2-BLIND-H19 and V2-BLIND-H55 (both written blind
        under D37 — H19 in the first batch, H55 in the second) sit in holdout — rewording
        either until it routes would tune it against the router and undo the blindness it
        exists to provide, so the misses are recorded instead.

        Two of the four blind compat rows miss, which is the finding rather than the
        noise: the router reaches a question that names a troubleshooting term and not
        one that only describes the symptom. That is the D16 gate working as specified
        and is a real reach limit, filed on the roadmap rather than patched here.
        """
        data = json.loads(
            (REPO_ROOT / "tests" / "fixtures" / "kb_eval_v2.json").read_text(encoding="utf-8")
        )
        compat = [q for q in data["queries"] if q["domain"] == "compat"]
        strategy = [q for q in data["queries"] if q["domain"] == "strategy"]

        holdout = [q for q in compat if q["split"] == "holdout"]
        missed_holdout = [
            q["id"] for q in holdout if not question_targets_compat_corpus(q["query"])
        ]
        self.assertEqual(missed_holdout, ["V2-BLIND-H19", "V2-BLIND-H55"])

        missed_tune = [
            q["id"]
            for q in compat
            if q["split"] == "tune" and not question_targets_compat_corpus(q["query"])
        ]
        self.assertEqual(missed_tune, ["V2-C-04"])

        false_positives = [
            q["id"] for q in strategy if question_targets_compat_corpus(q["query"])
        ]
        self.assertEqual(false_positives, [])


if __name__ == "__main__":
    unittest.main()
