/**
 * Title: Main tab Ask bar focus helpers
 * Purpose: Programmatic focus hops between unified input, attach, avatar, preset chips, Ask, and mic controls.
 * Used for: MainTab D-pad graph and liveTurnFocusGraph cross-row navigation.
 * Solves: Reliable focus targets without document.querySelector across shadow roots.
 * Does not: Register Decky onMove* handlers — callers wire graph edges with these helpers.
 */
import React, { useCallback, useMemo } from "react";

import { takeNavFocus } from "../utils/navFocusRegistry";
import { elementHasGamepadFocus } from "../utils/uiDocument";

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
  /**
   * Into the Ask text field from another container (a preset chip, the help chip, the avatar).
   *
   * Steam's own transfer first: the field registers its nav node as "unified-input". A plain
   * `focus()` across containers only moves `activeElement`; measured on device 2026-09-01, Down
   * from a preset chip on a freshly opened panel put the caret in the field while Steam bounced the
   * ring to the next chip in the row (runs/PRESET-ONE-LINE-03-carousel-fresh-mount.json, step 12).
   * The DOM fallback stays for the frames before Steam populates the ref and for mouse/touch, and
   * reports whether the ring actually followed, so a caller can let Steam take over when it did not.
   */
  const focusUnifiedTextField = useCallback((): boolean => {
    if (takeNavFocus("unified-input")) return true;
    const layer =
      refs.unifiedInputFieldLayerRef &&
      typeof refs.unifiedInputFieldLayerRef === "object" &&
      "current" in refs.unifiedInputFieldLayerRef
        ? (refs.unifiedInputFieldLayerRef as React.RefObject<HTMLDivElement | null>).current
        : null;
    const field = layer?.querySelector<HTMLTextAreaElement | HTMLInputElement>("textarea, input");
    if (!field) return false;
    field.focus();
    return elementHasGamepadFocus(field);
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

  /**
   * Up from the Ask bar into the preset row.
   *
   * The carousel is its own `Focusable`, i.e. a separate navigation container, so a plain `focus()`
   * on a chip only moves `activeElement` — Steam's ring stays where it was. Found on device
   * 2026-08-28: the ring went to the tab strip while a chip carried the highlight, and A activated
   * the tab. `takeNavFocus` is Steam's own transfer and is the supported way across that boundary
   * (navFocusRegistry).
   *
   * The DOM ladder stays as the fallback for the frames before Decky has populated the nav ref, and
   * for mouse and touch where there is no ring to move at all. It now reports whether the ring
   * actually followed rather than whether the element existed — the same honesty fix
   * `modalReturnFocusRegistry` needed, and for the same reason.
   */
  const focusFirstPresetChip = useCallback((): boolean => {
    const host = refs.presetCarouselHostRef.current;
    const help = host?.querySelector<HTMLElement>("button.bonsai-preset-help-chip");
    if (help) {
      help.focus();
      return elementHasGamepadFocus(help);
    }
    if (takeNavFocus("preset-carousel")) return true;
    const btn =
      host?.querySelector<HTMLElement>(
        ".bonsai-preset-carousel-slot--focus button.bonsai-preset-glass",
      ) ??
      host?.querySelector<HTMLElement>(
        '.bonsai-preset-carousel-slot[data-bonsai-preset-visible="true"] button.bonsai-preset-glass',
      );
    if (!btn) return false;
    btn.focus();
    return elementHasGamepadFocus(btn);
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
