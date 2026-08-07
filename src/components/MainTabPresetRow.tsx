/**
 * Title: Main tab preset row
 * Purpose: Top-of-Main row with help chip, animated preset carousel, and running-game join hints.
 * Used for: MainTab above the unified Ask bar for quick prompt seeding.
 * Solves: Wires preset animation modes and Ask-mode preference without bloating MainTab shell.
 * Does not: Own carousel timing math — see MainTabPresetAnimatedChips and presets data module.
 */
import React, { useEffect, useRef } from "react";
import { Button } from "@decky/ui";
import type { PresetPrompt } from "../data/presets";
import type { AskModeId } from "../data/askMode";
import { MainTabPresetAnimatedChips } from "./MainTabPresetAnimatedChips";
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
  presetChipAnimation?: "fade" | "carousel" | "static" | "stream";
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  onPresetPreferAskMode?: (mode: AskModeId) => void;
  presetCarouselInject?: { text: string } | null;
  isAsking: boolean;
  focusUnifiedTextField: () => boolean;
  presetCarouselHostRef: React.RefObject<HTMLDivElement | null>;
  useLocalKnowledgeBase?: boolean;
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
      {showPluginHelpChip && (
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
            minHeight: 34,
            fontSize: 12,
          }}
          aria-label="How to use bonsAI — open quick start"
        >
          How to use bonsAI
        </Button>
      )}
      <MainTabPresetAnimatedChips
        seeds={suggestedPrompts}
        setUnifiedInput={setUnifiedInput}
        fadeAnimationEnabled={presetChipAnimation === "fade" && presetChipFadeAnimationEnabled}
        animationMode={presetChipAnimation}
        onPreferAskMode={onPresetPreferAskMode}
        onCarouselExitDown={focusUnifiedTextField}
        useLocalKnowledgeBase={useLocalKnowledgeBase}
      />
      {presetCarouselInject?.text?.trim() ? (
        <Button
          className="bonsai-preset-glass bonsai-pyro-inject-chip"
          focusable
          onClick={() => {
            setUnifiedInput(joinPresetWithRunningGame(presetCarouselInject.text.trim()));
          }}
          style={{
            width: "100%",
            minHeight: 34,
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
          style={{ minHeight: 34, visibility: "hidden" }}
        />
      ) : null}
    </div>
  );
}
