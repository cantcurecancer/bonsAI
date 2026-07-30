/**
 * Title: Main tab Ask bar focus helpers
 * Purpose: Programmatic focus hops between unified input, attach, avatar, preset chips, Ask, and mic controls.
 * Used for: MainTab D-pad graph and liveTurnFocusGraph cross-row navigation.
 * Solves: Reliable focus targets without document.querySelector across shadow roots.
 * Does not: Register Decky onMove* handlers — callers wire graph edges with these helpers.
 */
import React, { useCallback, useMemo } from "react";

export type MainTabAskBarFocusRefs = {
  unifiedInputFieldLayerRef: React.Ref<HTMLDivElement>;
  attachActionHostRef: React.Ref<HTMLDivElement>;
  askBarHostRef: React.Ref<HTMLDivElement>;
  presetCarouselHostRef: React.RefObject<HTMLDivElement | null>;
};

export function useMainTabAskBarFocus(
  refs: MainTabAskBarFocusRefs,
  showAiCharacterChrome: boolean,
) {
  const focusUnifiedTextField = useCallback((): boolean => {
    const layer =
      refs.unifiedInputFieldLayerRef &&
      typeof refs.unifiedInputFieldLayerRef === "object" &&
      "current" in refs.unifiedInputFieldLayerRef
        ? (refs.unifiedInputFieldLayerRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const field = layer?.querySelector<HTMLTextAreaElement | HTMLInputElement>("textarea, input");
    if (!field) return false;
    field.focus();
    return true;
  }, [refs.unifiedInputFieldLayerRef]);

  const focusAttachPaperclip = useCallback((): boolean => {
    const host =
      refs.attachActionHostRef &&
      typeof refs.attachActionHostRef === "object" &&
      "current" in refs.attachActionHostRef
        ? (refs.attachActionHostRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const btn = host?.querySelector<HTMLElement>("button.bonsai-unified-input-corner-left");
    if (!btn) return false;
    btn.focus();
    return true;
  }, [refs.attachActionHostRef]);

  const focusAiCharacterAvatar = useCallback((): boolean => {
    if (!showAiCharacterChrome) return false;
    const layer =
      refs.unifiedInputFieldLayerRef &&
      typeof refs.unifiedInputFieldLayerRef === "object" &&
      "current" in refs.unifiedInputFieldLayerRef
        ? (refs.unifiedInputFieldLayerRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const avatar = layer?.querySelector<HTMLElement>(".bonsai-ai-character-avatar");
    if (!avatar) return false;
    avatar.focus();
    return true;
  }, [showAiCharacterChrome, refs.unifiedInputFieldLayerRef]);

  const focusFirstPresetChip = useCallback((): boolean => {
    const host = refs.presetCarouselHostRef.current;
    const help = host?.querySelector<HTMLElement>("button.bonsai-preset-help-chip");
    if (help) {
      help.focus();
      return true;
    }
    const btn =
      host?.querySelector<HTMLElement>(
        ".bonsai-preset-carousel-slot--focus button.bonsai-preset-glass",
      ) ??
      host?.querySelector<HTMLElement>(
        '.bonsai-preset-carousel-slot[data-bonsai-preset-visible="true"] button.bonsai-preset-glass',
      );
    if (!btn) return false;
    btn.focus();
    return true;
  }, [refs.presetCarouselHostRef]);

  const focusAskPrimary = useCallback((): boolean => {
    const host =
      refs.askBarHostRef &&
      typeof refs.askBarHostRef === "object" &&
      "current" in refs.askBarHostRef
        ? (refs.askBarHostRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const btn = host?.querySelector<HTMLElement>("button.bonsai-ask-primary");
    if (!btn) return false;
    btn.focus();
    return true;
  }, [refs.askBarHostRef]);

  const focusMicOrStop = useCallback((): boolean => {
    const host =
      refs.attachActionHostRef &&
      typeof refs.attachActionHostRef === "object" &&
      "current" in refs.attachActionHostRef
        ? (refs.attachActionHostRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const btn = host?.querySelector<HTMLElement>("button.bonsai-unified-input-corner-right");
    if (!btn) return false;
    btn.focus();
    return true;
  }, [refs.attachActionHostRef]);

  const focusAskModeButton = useCallback((): boolean => {
    const host =
      refs.attachActionHostRef &&
      typeof refs.attachActionHostRef === "object" &&
      "current" in refs.attachActionHostRef
        ? (refs.attachActionHostRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const btn = host?.querySelector<HTMLElement>("button.bonsai-ask-mode-trigger");
    if (!btn) return false;
    btn.focus();
    return true;
  }, [refs.attachActionHostRef]);

  const unifiedInputDeckNavHandlers = useMemo(
    () =>
      ({
        onMoveUp: () => focusFirstPresetChip(),
        onMoveLeft: () => focusAttachPaperclip(),
        onMoveDown: () => focusAskPrimary(),
        onMoveRight: () => focusAskModeButton(),
      }) as Record<string, unknown>,
    [focusAskPrimary, focusAttachPaperclip, focusFirstPresetChip, focusAskModeButton],
  );

  const avatarDeckNavHandlers = useMemo(
    () =>
      ({
        onMoveRight: () => focusUnifiedTextField(),
        onMoveDown: () => focusAttachPaperclip(),
      }) as Record<string, unknown>,
    [focusAttachPaperclip, focusUnifiedTextField],
  );

  return {
    focusUnifiedTextField,
    focusAttachPaperclip,
    focusAiCharacterAvatar,
    focusFirstPresetChip,
    focusAskPrimary,
    focusMicOrStop,
    focusAskModeButton,
    unifiedInputDeckNavHandlers,
    avatarDeckNavHandlers,
  };
}
