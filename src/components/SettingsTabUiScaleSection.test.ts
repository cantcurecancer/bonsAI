import { describe, expect, it, vi } from "vitest";
import { buildUiScaleBridgeNav, type UiScaleBridgeNavDeps } from "./SettingsTabUiScaleSection";

function makeDeps(overrides: Partial<UiScaleBridgeNavDeps> = {}): UiScaleBridgeNavDeps {
  return {
    stepManualProfile: vi.fn(() => true),
    toggleBridgeSliderEditing: vi.fn(),
    focusAutoToggle: vi.fn(() => true),
    focusResetButton: vi.fn(() => true),
    focusApplyButton: vi.fn(() => true),
    ...overrides,
  };
}

/*
 * Found on device 2026-09-03 (ONBUTTONDOWN-AUDIT-01), the same shape as the Ollama sliders'
 * DeckFocusSlider bug: Left/Right on the UI-scale manual-profile bridge stepped the value once and
 * then let Steam's own navigation carry that same press past the bridge, because the step ran from
 * `onButtonDown`, whose return value never consumes a direction the way a `Focusable` move handler
 * does. These pin the step to `onMoveLeft`/`onMoveRight`, and check that `onButtonDown` no longer
 * carries a second stepping path for the same press.
 */
describe("UI scale slider bridge D-pad handlers", () => {
  it("Left steps the manual profile exactly once and claims the move", () => {
    const deps = makeDeps();
    const nav = buildUiScaleBridgeNav(deps);
    expect((nav.onMoveLeft as () => boolean)()).toBe(true);
    expect(deps.stepManualProfile).toHaveBeenCalledTimes(1);
    expect(deps.stepManualProfile).toHaveBeenCalledWith(-1);
  });

  it("Right steps the manual profile exactly once and claims the move", () => {
    const deps = makeDeps();
    const nav = buildUiScaleBridgeNav(deps);
    expect((nav.onMoveRight as () => boolean)()).toBe(true);
    expect(deps.stepManualProfile).toHaveBeenCalledTimes(1);
    expect(deps.stepManualProfile).toHaveBeenCalledWith(1);
  });

  it("wires no onButtonDown handler, so a single press cannot step the value twice", () => {
    const nav = buildUiScaleBridgeNav(makeDeps());
    expect(nav.onButtonDown).toBeUndefined();
  });

  it("A toggles edit mode on the bridge and claims the press", () => {
    const deps = makeDeps();
    const nav = buildUiScaleBridgeNav(deps);
    expect((nav.onActivate as () => boolean)()).toBe(true);
    expect(deps.toggleBridgeSliderEditing).toHaveBeenCalledTimes(1);
  });

  it("Up hands the ring to the auto toggle above the bridge", () => {
    const deps = makeDeps();
    const nav = buildUiScaleBridgeNav(deps);
    expect((nav.onMoveUp as () => boolean)()).toBe(true);
    expect(deps.focusAutoToggle).toHaveBeenCalledTimes(1);
  });

  it("Down prefers the reset button, and falls back to Apply only when reset cannot take it", () => {
    const withReset = makeDeps();
    expect((buildUiScaleBridgeNav(withReset).onMoveDown as () => boolean)()).toBe(true);
    expect(withReset.focusResetButton).toHaveBeenCalledTimes(1);
    expect(withReset.focusApplyButton).not.toHaveBeenCalled();

    const noReset = makeDeps({ focusResetButton: vi.fn(() => false) });
    expect((buildUiScaleBridgeNav(noReset).onMoveDown as () => boolean)()).toBe(true);
    expect(noReset.focusResetButton).toHaveBeenCalledTimes(1);
    expect(noReset.focusApplyButton).toHaveBeenCalledTimes(1);
  });
});
