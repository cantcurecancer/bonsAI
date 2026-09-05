/**
 * Title: Main tab preset row
 * Purpose: The suggestion row above the Ask bar: the help chip until it is dismissed, then the
 *          animated preset chips, plus the running-game join hints and the agent-suggestion chip.
 * Used for: MainTab, in the bottom dock, for quick prompt seeding.
 * Solves: Wires preset animation modes and Ask-mode preference without bloating MainTab shell, and
 *         gives the help chip the whole row (maintainer, 2026-09-01) instead of stacking it above
 *         the chips — one row of height either way.
 * Does not: Own carousel timing math — see MainTabPresetAnimatedChips and presets data module.
 */
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@decky/ui";
import type { PresetPrompt } from "../data/presets";
import type { AskModeId } from "../data/askMode";
import { MainTabPresetAnimatedChips } from "./MainTabPresetAnimatedChips";
import { PRESET_CHIP_HEIGHT_PX } from "../features/preset-carousel/presetRowLayout";
import { joinPresetWithRunningGame } from "../utils/joinPresetWithRunningGame";
import {
  registerModalReturnFocusOwner,
  rememberModalReturnFocus,
} from "../features/plugin-shell/modalReturnFocusRegistry";

export type MainTabPresetRowProps = {
  suggestedPrompts: PresetPrompt[];
  showPluginHelpChip: boolean;
  onOpenPluginHelp: () => void;
  presetChipFadeAnimationEnabled?: boolean;
  presetChipAnimation?: "fade" | "carousel" | "static" | "decode";
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  onPresetPreferAskMode?: (mode: AskModeId) => void;
  presetCarouselInject?: { text: string } | null;
  isAsking: boolean;
  focusUnifiedTextField: () => boolean;
  presetCarouselHostRef: React.RefObject<HTMLDivElement | null>;
  useLocalKnowledgeBase?: boolean;
  /** "One suggestion chip" setting: the row shows one chip with the whole column. Off by default. */
  presetSingleChip?: boolean;
};

export function MainTabPresetRow({
  suggestedPrompts,
  showPluginHelpChip,
  onOpenPluginHelp,
  presetChipFadeAnimationEnabled = true,
  presetChipAnimation = "fade",
  setUnifiedInput,
  onPresetPreferAskMode,
  presetCarouselInject = null,
  isAsking,
  focusUnifiedTextField,
  presetCarouselHostRef,
  useLocalKnowledgeBase = false,
  presetSingleChip = false,
}: MainTabPresetRowProps) {
  const hadInjectChipRef = useRef(false);
  useEffect(() => {
    if (presetCarouselInject?.text?.trim()) {
      hadInjectChipRef.current = true;
    }
  }, [presetCarouselInject]);
  useEffect(() => {
    if (!isAsking && !presetCarouselInject?.text?.trim()) {
      hadInjectChipRef.current = false;
    }
  }, [isAsking, presetCarouselInject]);
  const showInjectPlaceholder =
    isAsking && hadInjectChipRef.current && !presetCarouselInject?.text?.trim();

  /*
   * Every chip mode's 60-second walk (PRESET_CAROUSEL_ACTIVE_MS) stops scheduling new cycles that
   * long after it starts, and normally restarts because a completed Ask reseeds `suggestedPrompts`
   * with new text -- `seedsKeyFrom` changes, so the mode's own effect restarts. A pinned QA batch
   * breaks that: it always resolves to its first three entries verbatim (data/presets.ts's
   * `applyTempFrozenCarousel`), so the text never changes and the effect never restarts -- ten
   * chips pinned and chips 6-10 never came into view (D58 #3, KB-ANSWER-02). This token is
   * independent of the seed text, so it restarts the walk even when the reseed produced exactly
   * the same three chips. Bumped on the Ask *completing* (isAsking true -> false), which is when
   * useBonsaiAskOrchestration actually reseeds -- not on Ask start.
   */
  const wasAskingRef = useRef(isAsking);
  const [askRestartToken, setAskRestartToken] = useState(0);
  useEffect(() => {
    if (wasAskingRef.current && !isAsking) {
      setAskRestartToken((t) => t + 1);
    }
    wasAskingRef.current = isAsking;
  }, [isAsking]);

  return (
    <div
      ref={presetCarouselHostRef}
      className={
        "bonsai-full-bleed-row bonsai-preset-row-host" +
        (presetChipAnimation === "fade" && presetChipFadeAnimationEnabled
          ? " bonsai-preset-row-host--fade-anim"
          : "")
      }
      style={{ display: "grid", minWidth: 0, width: "100%", boxSizing: "border-box" }}
    >
      {showPluginHelpChip ? (
        /*
         * The help chip owns the row until it is dismissed; the suggestion chips mount only after
         * that. Two things follow: the Ask bar's Up press lands here first (useMainTabAskBarFocus
         * looks for this chip before the carousel), and the chips' 60-second rotation window is
         * not spent while the help chip is up.
         */
        <Button
          className="bonsai-preset-glass bonsai-preset-help-chip"
          ref={(el: HTMLElement | null) => registerModalReturnFocusOwner("plugin-help", el)}
          {...({
            onMoveDown: () => focusUnifiedTextField(),
          } as Record<string, unknown>)}
          onClick={() => {
            rememberModalReturnFocus("plugin-help");
            onOpenPluginHelp();
          }}
          style={{
            width: "100%",
            minHeight: PRESET_CHIP_HEIGHT_PX,
            fontSize: 12,
          }}
          aria-label="How to use bonsAI — open quick start"
        >
          How to use bonsAI
        </Button>
      ) : (
        <MainTabPresetAnimatedChips
          seeds={suggestedPrompts}
          setUnifiedInput={setUnifiedInput}
          fadeAnimationEnabled={presetChipAnimation === "fade" && presetChipFadeAnimationEnabled}
          animationMode={presetChipAnimation}
          onPreferAskMode={onPresetPreferAskMode}
          onCarouselExitDown={focusUnifiedTextField}
          useLocalKnowledgeBase={useLocalKnowledgeBase}
          askRestartToken={askRestartToken}
          presetSingleChip={presetSingleChip}
        />
      )}
      {presetCarouselInject?.text?.trim() ? (
        <Button
          className="bonsai-preset-glass bonsai-pyro-inject-chip"
          focusable
          onClick={() => {
            setUnifiedInput(joinPresetWithRunningGame(presetCarouselInject.text.trim()));
          }}
          style={{
            width: "100%",
            minHeight: PRESET_CHIP_HEIGHT_PX,
            fontSize: 12,
            color: "#c4d3e2",
          }}
          aria-label="Agent suggestion"
        >
          {presetCarouselInject.text.trim()}
        </Button>
      ) : showInjectPlaceholder ? (
        <div
          aria-hidden
          className="bonsai-preset-inject-placeholder"
          style={{ minHeight: PRESET_CHIP_HEIGHT_PX, visibility: "hidden" }}
        />
      ) : null}
    </div>
  );
}
