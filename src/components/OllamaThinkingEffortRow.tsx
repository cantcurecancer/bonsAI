/**
 * Title: Thinking effort row
 * Purpose: Four-stop Off / Brief / Balanced / Deep control for hidden model reasoning.
 * Used for: OllamaTab, directly below Reply style.
 * Solves: Lets a user trade latency for reasoning depth without editing settings.json.
 * Does not: Decide the wire value or budgets — backend `ollama_ask_budgets` owns both, and
 *   a model that cannot think falls back silently there (decision D21).
 */
import { Focusable, Button } from "@decky/ui";

import {
  ASK_THINK_EFFORT_DESCRIPTIONS,
  ASK_THINK_EFFORT_IDS,
  ASK_THINK_EFFORT_LABELS,
  type AskThinkEffortId,
} from "../data/askThinkEffort";

export type OllamaThinkingEffortRowProps = {
  value: AskThinkEffortId;
  onChange: (v: AskThinkEffortId) => void;
  /** Host for the focus entry point, so neighbours can hand focus to the first button. */
  hostRef?: React.Ref<HTMLDivElement>;
  onMoveUp: () => boolean;
  onMoveDown: () => boolean;
};

export function OllamaThinkingEffortRow({
  value,
  onChange,
  hostRef,
  onMoveUp,
  onMoveDown,
}: OllamaThinkingEffortRowProps) {
  return (
    <div ref={hostRef} style={{ width: "100%", minWidth: 0, maxWidth: "100%" }}>
      <div style={{ color: "#d9d9d9", fontWeight: 600, fontSize: 13 }}>Thinking</div>
      <div
        className="bonsai-prose"
        style={{ fontSize: 11, color: "#9fb7d5", marginBottom: 8, lineHeight: 1.35 }}
      >
        {ASK_THINK_EFFORT_DESCRIPTIONS[value]}
      </div>
      {/* onMove* live on the Focusable, never on the Buttons — they do not fire on a
          Decky Button. The parent owns the graph; the buttons are leaves. */}
      <Focusable
        flow-children="horizontal"
        style={{
          display: "flex",
          gap: 6,
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          alignItems: "stretch",
        }}
        {...({
          onMoveUp: () => onMoveUp(),
          onMoveDown: () => onMoveDown(),
        } as unknown as Record<string, unknown>)}
      >
        {ASK_THINK_EFFORT_IDS.map((option) => {
          const active = option === value;
          return (
            <Button
              key={`think-effort-${option}`}
              onClick={() => onChange(option)}
              style={{
                flex: 1,
                minHeight: 36,
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 4px",
                borderRadius: 4,
                border: active
                  ? "1px solid rgba(255,255,255,0.45)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: active
                  ? "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 100%)"
                  : "rgba(255,255,255,0.04)",
                color: active ? "#f0f4f8" : "#9fb0c0",
                boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
              }}
              aria-label={`Set thinking to ${ASK_THINK_EFFORT_LABELS[option]}`}
            >
              {ASK_THINK_EFFORT_LABELS[option]}
            </Button>
          );
        })}
      </Focusable>
    </div>
  );
}
