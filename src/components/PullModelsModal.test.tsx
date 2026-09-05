/**
 * Covers the three parts plan 36 added to the picker: a typed custom-tag pull, the "Use for Ask"
 * pin, and the 30-day "New" badge. The TextField Decky stub renders as a plain `<div>`
 * (fakeDeckyUi.tsx), and React's ChangeEventPlugin only synthesizes `onChange` for real form
 * elements, so a DOM-dispatched "change"/"input" event on it never reaches the component (checked
 * directly, not assumed) -- the same reason `ChatSlotRenameModal.test.tsx` never simulates typing
 * either. Coverage for the custom-tag *input itself* is therefore: the pure validity check
 * (isPlausibleOllamaPullTag, in mergePullModelCatalog.test.ts) plus the button's driven-by-state
 * disabled/enabled behaviour here; the on-Deck row covers actually typing a tag.
 */
import { describe, expect, it } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { toaster } from "@decky/api";

import {
  PullModelsModal,
  computeUpdatedPullRecord,
  isRecentPullModelTag,
  PULL_MODEL_NEW_BADGE_STORAGE_KEY,
  PULL_MODEL_NEW_BADGE_WINDOW_MS,
  type PullModelPullRecord,
} from "./PullModelsModal";
import { getRpcCallLog, setRpcHandler } from "../test-harness/fakeDeckyRpc";
import { defaultSettingsFixture } from "../test-harness/rpcFixtures";

function renderModal(overrides: Partial<React.ComponentProps<typeof PullModelsModal>> = {}) {
  return render(
    <PullModelsModal
      activeRoutingTag={null}
      onCancel={() => {}}
      onPullAccepted={() => {}}
      embedded
      {...overrides}
    />
  );
}

function setInstalledModels(models: string[]) {
  setRpcHandler("test_ollama_connection", () => ({ reachable: true, version: "0.5.0", models }));
}

/**
 * The picker defaults to "Essentials only", which shows just the three one-pull multimodal
 * presets (all "essentials"-group, all vision-capable). A "smallest"-group, text-only tag like
 * qwen2.5:1.5b or llama3.2:3b needs this off to appear as a catalog row at all.
 */
function showAllGroups(container: HTMLElement) {
  const toggle = container.querySelector(
    '[aria-label="Essentials only — show Tier 1 and Tier 2 one-model presets"]'
  ) as HTMLButtonElement;
  fireEvent.click(toggle);
}

describe("computeUpdatedPullRecord", () => {
  const now = 1_000_000_000_000;

  it("seeds every already-installed tag as already-old on the very first run (no prior record)", () => {
    const record = computeUpdatedPullRecord(new Set(["qwen2.5:1.5b"]), null, now);
    expect(isRecentPullModelTag(record, "qwen2.5:1.5b", now)).toBe(false);
  });

  it("records a tag installed for the first time on a later run as new", () => {
    // storedRecord is {} (not null) -- this browser has run before, just never saw this tag.
    const record = computeUpdatedPullRecord(new Set(["qwen2.5:1.5b"]), {}, now);
    expect(isRecentPullModelTag(record, "qwen2.5:1.5b", now)).toBe(true);
    expect(record["qwen2.5:1.5b"]).toBe(now);
  });

  it("keeps an existing timestamp rather than overwriting it on a later observation", () => {
    const stored: PullModelPullRecord = { "qwen2.5:1.5b": now - 1000 };
    const record = computeUpdatedPullRecord(new Set(["qwen2.5:1.5b"]), stored, now);
    expect(record["qwen2.5:1.5b"]).toBe(now - 1000);
  });

  it("does not invent a timestamp for a tag that is not installed", () => {
    const record = computeUpdatedPullRecord(new Set(), {}, now);
    expect(Object.keys(record)).toHaveLength(0);
  });
});

describe("isRecentPullModelTag", () => {
  const now = 1_000_000_000_000;

  it("is true right at the moment it was recorded", () => {
    expect(isRecentPullModelTag({ tag: now }, "tag", now)).toBe(true);
  });

  it("is true just inside the 30-day window", () => {
    expect(isRecentPullModelTag({ tag: now - PULL_MODEL_NEW_BADGE_WINDOW_MS }, "tag", now)).toBe(true);
  });

  it("is false just past the 30-day window", () => {
    expect(isRecentPullModelTag({ tag: now - PULL_MODEL_NEW_BADGE_WINDOW_MS - 1 }, "tag", now)).toBe(false);
  });

  it("is false for a tag with no recorded timestamp", () => {
    expect(isRecentPullModelTag({}, "tag", now)).toBe(false);
  });

  it("is false for a timestamp in the future (clock skew) rather than throwing", () => {
    expect(isRecentPullModelTag({ tag: now + 10_000 }, "tag", now)).toBe(false);
  });
});

describe("PullModelsModal custom tag entry", () => {
  it("renders the custom tag field and starts the Pull button disabled with nothing typed", () => {
    const { container } = renderModal();
    const field = container.querySelector('[data-decky-ui="TextField"]');
    expect(field).not.toBeNull();
    const btn = container.querySelector('[aria-label="Pull custom model tag"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.disabled).toBe(true);
  });
});

describe("PullModelsModal 'Use for Ask' pin", () => {
  it("shows the hollow star for an installed model with no saved try-order yet", async () => {
    setInstalledModels(["qwen2.5:1.5b"]);
    const { container } = renderModal();
    showAllGroups(container);
    await waitFor(() => {
      expect(container.querySelector('[aria-label="Use qwen2.5:1.5b for Ask"]')).not.toBeNull();
    });
  });

  it("shows the filled star immediately for whichever tag is already first in the saved text try-order", async () => {
    setInstalledModels(["qwen2.5:1.5b"]);
    setRpcHandler("load_settings", () => ({
      ...defaultSettingsFixture(),
      text_model_routing_order: ["qwen2.5:1.5b"],
    }));
    const { container } = renderModal();
    showAllGroups(container);
    await waitFor(() => {
      expect(container.querySelector('[aria-label="qwen2.5:1.5b is used for Ask"]')).not.toBeNull();
    });
  });

  it("pressing the pin button saves this tag to the front of the text try-order and shows a confirmation", async () => {
    setInstalledModels(["qwen2.5:1.5b", "llama3.2:3b"]);
    setRpcHandler("load_settings", () => ({
      ...defaultSettingsFixture(),
      text_model_routing_order: ["llama3.2:3b"],
    }));
    const { container } = renderModal();
    showAllGroups(container);

    const pinBtn = await waitFor(() => {
      const el = container.querySelector('[aria-label="Use qwen2.5:1.5b for Ask"]');
      expect(el).not.toBeNull();
      return el as HTMLButtonElement;
    });

    fireEvent.click(pinBtn);

    await waitFor(() => {
      expect(container.querySelector('[aria-label="qwen2.5:1.5b is used for Ask"]')).not.toBeNull();
    });

    const saveCall = getRpcCallLog().find((c) => c.method === "save_settings");
    expect(saveCall).toBeTruthy();
    const payload = saveCall?.args[0] as { text_model_routing_order?: string[]; vision_model_routing_order?: unknown };
    expect(payload.text_model_routing_order).toEqual(["qwen2.5:1.5b", "llama3.2:3b"]);
    expect(payload.vision_model_routing_order).toBeUndefined();

    expect(toaster.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Now used for Ask", body: "qwen2.5:1.5b" })
    );
  });

  it("also pins the vision try-order when the model is a catalog vision entry", async () => {
    // qwen2.5vl:3b carries the "vision" tag in the bundled catalog.
    setInstalledModels(["qwen2.5vl:3b"]);
    const { container } = renderModal();

    const pinBtn = await waitFor(() => {
      const el = container.querySelector('[aria-label="Use qwen2.5vl:3b for Ask"]');
      expect(el).not.toBeNull();
      return el as HTMLButtonElement;
    });

    fireEvent.click(pinBtn);

    await waitFor(() => {
      const saveCall = getRpcCallLog().find((c) => c.method === "save_settings");
      expect(saveCall).toBeTruthy();
    });

    const saveCall = getRpcCallLog().find((c) => c.method === "save_settings");
    const payload = saveCall?.args[0] as { text_model_routing_order?: string[]; vision_model_routing_order?: string[] };
    expect(payload.text_model_routing_order).toEqual(["qwen2.5vl:3b"]);
    expect(payload.vision_model_routing_order).toEqual(["qwen2.5vl:3b"]);
  });

  it("pins a custom (uncatalogued) installed tag to text order only, not vision", async () => {
    setInstalledModels(["some-custom-tag:latest"]);
    const { container } = renderModal();

    const pinBtn = await waitFor(() => {
      const el = container.querySelector('[aria-label="Use some-custom-tag:latest for Ask"]');
      expect(el).not.toBeNull();
      return el as HTMLButtonElement;
    });

    fireEvent.click(pinBtn);

    await waitFor(() => {
      const saveCall = getRpcCallLog().find((c) => c.method === "save_settings");
      expect(saveCall).toBeTruthy();
    });

    const saveCall = getRpcCallLog().find((c) => c.method === "save_settings");
    const payload = saveCall?.args[0] as { text_model_routing_order?: string[]; vision_model_routing_order?: unknown };
    expect(payload.text_model_routing_order).toEqual(["some-custom-tag:latest"]);
    expect(payload.vision_model_routing_order).toBeUndefined();
  });
});

describe("PullModelsModal 'New' badge", () => {
  it("does not badge an already-installed model the very first time the picker has ever opened", async () => {
    window.localStorage.removeItem(PULL_MODEL_NEW_BADGE_STORAGE_KEY);
    setInstalledModels(["qwen2.5:1.5b"]);
    const { container, rerender } = renderModal();
    await waitFor(() => {
      expect(window.localStorage.getItem(PULL_MODEL_NEW_BADGE_STORAGE_KEY)).not.toBeNull();
    });
    rerender(<PullModelsModal activeRoutingTag={null} onCancel={() => {}} onPullAccepted={() => {}} embedded />);
    expect(container.querySelector(".bonsai-pullmodels-new-badge")).toBeNull();
  });

  it("badges a tag recorded within the last 30 days", async () => {
    setInstalledModels(["qwen2.5:1.5b"]);
    window.localStorage.setItem(
      PULL_MODEL_NEW_BADGE_STORAGE_KEY,
      JSON.stringify({ "qwen2.5:1.5b": Date.now() - 1000 })
    );
    const { container } = renderModal();
    showAllGroups(container);
    await waitFor(() => {
      expect(container.querySelector(".bonsai-pullmodels-new-badge")?.textContent).toBe("New");
    });
  });

  it("does not badge a tag recorded more than 30 days ago", async () => {
    setInstalledModels(["qwen2.5:1.5b"]);
    window.localStorage.setItem(
      PULL_MODEL_NEW_BADGE_STORAGE_KEY,
      JSON.stringify({ "qwen2.5:1.5b": Date.now() - PULL_MODEL_NEW_BADGE_WINDOW_MS - 5000 })
    );
    const { container } = renderModal();
    showAllGroups(container);
    await waitFor(() => {
      expect(container.querySelector('[aria-label="Use qwen2.5:1.5b for Ask"]')).not.toBeNull();
    });
    expect(container.querySelector(".bonsai-pullmodels-new-badge")).toBeNull();
  });
});
