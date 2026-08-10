"""Unit tests for C1 Ask token budgets and soft-continue cue helpers."""

from __future__ import annotations

import unittest

from backend.services.ollama_ask_budgets import (
    ASK_MAX_SOFT_CONTINUES,
    ASK_VISIBLE_NUM_PREDICT,
    SOFT_CONTINUE_CUE,
    resolve_ask_token_budgets,
    strip_soft_continue_cue,
)


class OllamaAskBudgetsTests(unittest.TestCase):
    def test_visible_caps_match_bug_v1_targets(self) -> None:
        self.assertEqual(ASK_VISIBLE_NUM_PREDICT["speed"], 800)
        self.assertEqual(ASK_VISIBLE_NUM_PREDICT["deep"], 1200)
        self.assertEqual(ASK_VISIBLE_NUM_PREDICT["strategy"], 1600)

    def test_default_effort_keeps_think_false_and_visible_only_budget(self) -> None:
        for mode, visible in ASK_VISIBLE_NUM_PREDICT.items():
            budgets = resolve_ask_token_budgets(mode)
            self.assertEqual(budgets["think"], False)
            self.assertEqual(budgets["think_effort"], "off")
            self.assertEqual(budgets["thinking_budget"], 0)
            self.assertEqual(budgets["visible_num_predict"], visible)
            self.assertEqual(budgets["num_predict"], visible)
            self.assertEqual(budgets["max_continues"], ASK_MAX_SOFT_CONTINUES)

    def test_effort_levels_add_thinking_budget_to_num_predict(self) -> None:
        low = resolve_ask_token_budgets("deep", think_effort="low")
        self.assertEqual(low["think"], "low")
        self.assertEqual(low["thinking_budget"], 256)
        self.assertEqual(low["num_predict"], 1200 + 256)

        high = resolve_ask_token_budgets("speed", think_effort="high")
        self.assertEqual(high["think"], "high")
        self.assertEqual(high["num_predict"], 800 + 1024)

    def test_unknown_mode_and_effort_fall_back_safely(self) -> None:
        budgets = resolve_ask_token_budgets("nope", think_effort="spicy")
        self.assertEqual(budgets["ask_mode"], "speed")
        self.assertEqual(budgets["think_effort"], "off")
        self.assertEqual(budgets["think"], False)
        self.assertEqual(budgets["num_predict"], 800)

    def test_strip_soft_continue_cue_removes_trailing_marker_only(self) -> None:
        body = "Hello world"
        self.assertEqual(strip_soft_continue_cue(body), body)
        self.assertEqual(
            strip_soft_continue_cue(body + "\n\n" + SOFT_CONTINUE_CUE),
            body,
        )
        self.assertEqual(
            strip_soft_continue_cue(body + "\n\n" + SOFT_CONTINUE_CUE + "   "),
            body,
        )
        # Cue mid-body is content, not the ephemeral tail marker.
        mid = f"Say {SOFT_CONTINUE_CUE} aloud"
        self.assertEqual(strip_soft_continue_cue(mid), mid)


if __name__ == "__main__":
    unittest.main()
