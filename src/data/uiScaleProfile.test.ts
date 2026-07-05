import { describe, expect, it } from "vitest";
import {
  classifyUiScaleProfile,
  detectDisplayContext,
  EXTERNAL_COUCH_VIEWPORT_MIN_PX,
  HANDHELD_VIEWPORT_MAX_PX,
  manualUiScaleProfileAtIndex,
  normalizeUiScaleProfileId,
  profileScaleMultiplier,
} from "./uiScaleProfile";

describe("uiScaleProfile", () => {
  it("detectDisplayContext: narrow viewport is internal", () => {
    expect(detectDisplayContext(480, 2560, 1600)).toBe("internal");
  });

  it("detectDisplayContext: Deck native screen is internal", () => {
    expect(detectDisplayContext(0, 1280, 800)).toBe("internal");
  });

  it("detectDisplayContext: wide viewport on large screen is external", () => {
    expect(detectDisplayContext(720, 1920, 1080)).toBe("external");
  });

  it("classifyUiScaleProfile: manual mode uses manual profile", () => {
    expect(
      classifyUiScaleProfile({
        autoEnabled: false,
        manualProfile: "couch",
        viewportWidthPx: 400,
      }),
    ).toBe("couch");
  });

  it("classifyUiScaleProfile: auto internal -> handheld", () => {
    expect(
      classifyUiScaleProfile({
        autoEnabled: true,
        manualProfile: "couch",
        viewportWidthPx: 500,
      }),
    ).toBe("handheld");
  });

  it("classifyUiScaleProfile: auto external wide -> couch", () => {
    expect(
      classifyUiScaleProfile({
        autoEnabled: true,
        manualProfile: "handheld",
        viewportWidthPx: EXTERNAL_COUCH_VIEWPORT_MIN_PX,
        screenWidthPx: 3840,
        screenHeightPx: 2160,
      }),
    ).toBe("couch");
  });

  it("classifyUiScaleProfile: auto external narrow -> desktop", () => {
    expect(
      classifyUiScaleProfile({
        autoEnabled: true,
        manualProfile: "handheld",
        viewportWidthPx: HANDHELD_VIEWPORT_MAX_PX + 20,
        screenWidthPx: 1920,
        screenHeightPx: 1080,
      }),
    ).toBe("desktop");
  });

  it("normalizeUiScaleProfileId falls back to handheld", () => {
    expect(normalizeUiScaleProfileId("bogus")).toBe("handheld");
    expect(normalizeUiScaleProfileId("desktop")).toBe("desktop");
  });

  it("manualUiScaleProfileAtIndex snaps to three stops", () => {
    expect(manualUiScaleProfileAtIndex(0)).toBe("handheld");
    expect(manualUiScaleProfileAtIndex(1)).toBe("desktop");
    expect(manualUiScaleProfileAtIndex(2)).toBe("couch");
  });

  it("profileScaleMultiplier: couch > handheld", () => {
    expect(profileScaleMultiplier("couch")).toBeGreaterThan(profileScaleMultiplier("handheld"));
  });
});
