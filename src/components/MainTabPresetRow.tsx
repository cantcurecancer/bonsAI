import React, { useEffect, useRef } from "react";
import { Button, Router } from "@decky/ui";
import type { PresetPrompt } from "../data/presets";
import type { AskModeId } from "../data/askMode";
import { MainTabPresetAnimatedChips } from "./MainTabPresetAnimatedChips";
import { joinPresetWithRunningGame } from "../utils/joinPresetWithRunningGame";

export type MainTabPresetRowProps = {
  suggestedPrompts: PresetPrompt[];
  showPluginHelpChip: boolean;
  onOpenPluginHelp: () => void;
  presetChipFadeAnimationEnabled?: boolean;
  presetChipAnimation?: "fade" | "carousel" | "static";
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  onPresetPreferAskMode?: (mode: AskModeId) => void;
  presetCarouselInject?: { text: string } | null;
  isAsking: boolean;
  focusUnifiedTextField: () => boolean;
  presetCarouselHostRef: React.RefObject<HTMLDivElement | null>;
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
      className="bonsai-full-bleed-row bonsai-preset-row-host"
      style={{ display: "grid", gap: 8, minWidth: 0, width: "100%", boxSizing: "border-box" }}
    >
      {showPluginHelpChip && (
        <Button
          className="bonsai-preset-glass bonsai-preset-help-chip"
          {...({
            onMoveDown: () => focusUnifiedTextField(),
          } as Record<string, unknown>)}
          onClick={() => onOpenPluginHelp()}
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
      />
      {presetCarouselInject?.text?.trim() ? (
        <Button
          className="bonsai-preset-glass bonsai-pyro-inject-chip"
          focusable
          onClick={() => {
            const gameName = Router.MainRunningApp?.display_name ?? "";
            const t = presetCarouselInject.text.trim();
            setUnifiedInput(gameName ? joinPresetWithRunningGame(t, gameName) : t);
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
