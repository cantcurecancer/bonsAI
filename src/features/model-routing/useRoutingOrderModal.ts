/**
 * Title: Model try-order modal
 * Purpose: Open the text/vision try-order picker — probe the host, list installed models, save the order.
 * Used for: index.tsx, which hands the opener to the Ollama tab.
 * Solves: Keeps host probing and the settings round-trip for routing order out of the plugin shell.
 * Does not: Decide fallback order at Ask time — that is backend.ollama_routing.resolve_routing_order.
 */
import { useCallback } from "react";
import { toaster } from "@decky/api";
import { showModal } from "@decky/ui";
import React from "react";

import { ModelRoutingOrderModal, type ModelRoutingOrderKind } from "../../components/ModelRoutingOrderModal";
import type { DeveloperConnectionStatus } from "../../components/DeveloperTab";
import { OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP, type BonsaiSettings } from "../../data/bonsaiSettingsSchema";
import type { ModelPolicyTierId } from "../../data/modelPolicy";
import type { PullModelEntry } from "../../data/pullModelCatalog";
import { patchPendingSessionSettingsSnapshot } from "../../utils/bonsaiSessionSurvival";
import { callDeckyWithTimeout, formatDeckyRpcError } from "../../utils/deckyCall";

/** Loopback probes can start systemd / `ollama serve`, so they get a much longer deadline. */
const CONNECTION_TEST_TIMEOUT_SECONDS = 10;
const LOOPBACK_PROBE_EXTRA_MS = 42000;
const REMOTE_PROBE_EXTRA_MS = 3000;

export type UseRoutingOrderModalArgs = {
  ollamaLocalOnDeck: boolean;
  ollamaIp: string;
  textModelRoutingOrder: string[];
  visionModelRoutingOrder: string[];
  setTextModelRoutingOrder: (order: string[]) => void;
  setVisionModelRoutingOrder: (order: string[]) => void;
  catalogByTag: Map<string, PullModelEntry>;
  modelPolicyTier: ModelPolicyTierId;
  modelPolicyNonFossUnlocked: boolean;
  modelAllowHighVramFallbacks: boolean;
  setLastConnectionStatus: (status: DeveloperConnectionStatus) => void;
  captureSessionBeforeModal: () => void;
  finalizeShowModalAndRestoreActiveTab: (close: () => void) => void;
  pauseDebouncedSettingsSave: () => Promise<void>;
  buildSettingsPayload: (patch: Partial<BonsaiSettings>) => BonsaiSettings;
  hydrateFromSettings: (saved: BonsaiSettings) => void;
};

export function useRoutingOrderModal(a: UseRoutingOrderModalArgs) {
  return useCallback(
    async (kind: ModelRoutingOrderKind) => {
      const target = a.ollamaLocalOnDeck ? OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP : a.ollamaIp.trim();
      if (!target) {
        toaster.toast({
          title: "No Ollama host",
          body: a.ollamaLocalOnDeck
            ? "Enable Run AI on this Deck or set a PC address first."
            : "Enter a PC address on the Ollama tab first.",
          duration: 5000,
        });
        return;
      }

      const loopbackLikelyProbe =
        a.ollamaLocalOnDeck ||
        /^\s*127\.0\.0\.1\s*(:\s*\d+)?\s*$/i.test(target) ||
        /^\s*localhost\s*(:\s*\d+)?\s*$/i.test(target);
      const rpcDeadlineMs =
        CONNECTION_TEST_TIMEOUT_SECONDS * 1000 +
        (loopbackLikelyProbe ? LOOPBACK_PROBE_EXTRA_MS : REMOTE_PROBE_EXTRA_MS);

      let installed: string[] = [];
      try {
        const result = await callDeckyWithTimeout<[string, number], DeveloperConnectionStatus>(
          "test_ollama_connection",
          [target, CONNECTION_TEST_TIMEOUT_SECONDS],
          rpcDeadlineMs,
        );
        a.setLastConnectionStatus(result);
        if (result.reachable && Array.isArray(result.models)) {
          installed = result.models.filter(Boolean);
        }
      } catch (e: unknown) {
        toaster.toast({
          title: "Could not list models",
          body: formatDeckyRpcError(e),
          duration: 5000,
        });
        return;
      }

      if (installed.length === 0) {
        toaster.toast({
          title: "No installed models",
          body: "Pull a model on the Ollama tab (Browse models or Install options), then try again.",
          duration: 5000,
        });
        return;
      }

      a.captureSessionBeforeModal();
      const savedOrder = kind === "vision" ? a.visionModelRoutingOrder : a.textModelRoutingOrder;
      const handle = showModal(
        React.createElement(ModelRoutingOrderModal, {
          kind,
          installedTags: installed,
          catalogByTag: a.catalogByTag,
          modelPolicyTier: a.modelPolicyTier,
          modelPolicyNonFossUnlocked: a.modelPolicyNonFossUnlocked,
          modelAllowHighVramFallbacks: a.modelAllowHighVramFallbacks,
          savedOrder,
          onSave: async (order: string[]) => {
            if (kind === "vision") {
              a.setVisionModelRoutingOrder(order);
            } else {
              a.setTextModelRoutingOrder(order);
            }
            await a.pauseDebouncedSettingsSave();
            const patch =
              kind === "vision"
                ? { vision_model_routing_order: order }
                : { text_model_routing_order: order };
            const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>("save_settings", [
              a.buildSettingsPayload(patch),
            ]);
            a.hydrateFromSettings(saved);
            // The session snapshot captured before this modal opened still holds the OLD try order.
            // Decky remounts Content when the modal closes, and that restore re-hydrates settings
            // from the snapshot — over the save that just succeeded — after which the debounced save
            // writes the old order back to disk. Measured on the Deck 2026-09-06: the file held the
            // new order at 00:44:20.383 and the old empty one 0.6s later, so setting an order looked
            // like it did nothing. Same defect as the character picker and the models hub, which both
            // already patch here; this was the third opener and was missed.
            patchPendingSessionSettingsSnapshot(
              kind === "vision" ? { visionModelRoutingOrder: order } : { textModelRoutingOrder: order },
            );
          },
          onClose: () => {
            a.finalizeShowModalAndRestoreActiveTab(() => handle.Close());
          },
        }),
      );
    },
    [
      a.ollamaLocalOnDeck,
      a.ollamaIp,
      a.visionModelRoutingOrder,
      a.textModelRoutingOrder,
      a.catalogByTag,
      a.modelPolicyTier,
      a.modelPolicyNonFossUnlocked,
      a.modelAllowHighVramFallbacks,
      a.setLastConnectionStatus,
      a.captureSessionBeforeModal,
      a.finalizeShowModalAndRestoreActiveTab,
      a.setVisionModelRoutingOrder,
      a.setTextModelRoutingOrder,
      a.pauseDebouncedSettingsSave,
      a.buildSettingsPayload,
      a.hydrateFromSettings,
    ],
  );
}
