/**
 * Title: Character picker modal
 * Purpose: Own the AI-character picker modal and the save_settings write it commits.
 * Used for: index.tsx — the Main tab character avatar action.
 * Solves: Keeps optimistic local state updates plus a settings round-trip out of the shell.
 * Does not: Own the character catalog — see data/characterCatalog and the modal component.
 */
import { useCallback } from "react";
import { showModal } from "@decky/ui";
import { toaster } from "@decky/api";

import { CharacterPickerModal } from "../../components/CharacterPickerModal";
import { callDeckyWithTimeout, formatDeckyRpcError } from "../../utils/deckyCall";
import {
  normalizeAiCharacterCustomText,
  normalizeAiCharacterPresetId,
} from "../../data/bonsaiSettingsNormalizers";
import type { BonsaiSettings } from "../../data/bonsaiSettingsSchema";

export type UseCharacterPickerModalArgs = {
  aiCharacterRandom: boolean;
  aiCharacterPresetId: string;
  aiCharacterCustomText: string;
  setAiCharacterRandom: (v: boolean) => void;
  setAiCharacterPresetId: (v: string) => void;
  setAiCharacterCustomText: (v: string) => void;
  /**
   * Builds a full settings payload from the current snapshot plus a patch. Depending on this
   * alone is sufficient: it is memoized on the settings snapshot, so its identity already
   * changes whenever any setting does.
   */
  buildSettingsPayload: (patch?: Partial<BonsaiSettings>) => BonsaiSettings;
  hydrateFromSettings: (settings: BonsaiSettings) => void;
  captureSessionBeforeModal: () => void;
  finalizeShowModalAndRestoreActiveTab: (close: () => void) => void;
};

export function useCharacterPickerModal({
  aiCharacterRandom,
  aiCharacterPresetId,
  aiCharacterCustomText,
  setAiCharacterRandom,
  setAiCharacterPresetId,
  setAiCharacterCustomText,
  buildSettingsPayload,
  hydrateFromSettings,
  captureSessionBeforeModal,
  finalizeShowModalAndRestoreActiveTab,
}: UseCharacterPickerModalArgs): () => void {
  return useCallback(() => {
    captureSessionBeforeModal();
    // Note this opener does not set the shell's return-tab ref, unlike the plugin-help and
    // desktop-note openers. Preserved from the code this was extracted from.
    const handle = showModal(
      <CharacterPickerModal
        initialDraft={{
          random: aiCharacterRandom,
          presetId: aiCharacterPresetId,
          customText: aiCharacterCustomText,
        }}
        onCancel={() => {
          finalizeShowModalAndRestoreActiveTab(() => handle.Close());
        }}
        onOK={async (next) => {
          const pid = normalizeAiCharacterPresetId(next.presetId);
          const ctxt = normalizeAiCharacterCustomText(next.customText);
          // Applied locally first so the avatar updates even if the save round-trip fails.
          setAiCharacterRandom(next.random);
          setAiCharacterPresetId(pid);
          setAiCharacterCustomText(ctxt);
          try {
            const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>(
              "save_settings",
              [
                buildSettingsPayload({
                  ai_character_random: next.random,
                  ai_character_preset_id: pid,
                  ai_character_custom_text: ctxt,
                }),
              ]
            );
            hydrateFromSettings(saved);
            finalizeShowModalAndRestoreActiveTab(() => handle.Close());
          } catch (err: unknown) {
            console.error("save_settings failed (character picker OK)", err);
            toaster.toast({
              title: "Character not saved",
              body: formatDeckyRpcError(err),
              duration: 5000,
            });
          }
        }}
      />
    );
  }, [
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    setAiCharacterRandom,
    setAiCharacterPresetId,
    setAiCharacterCustomText,
    buildSettingsPayload,
    hydrateFromSettings,
    captureSessionBeforeModal,
    finalizeShowModalAndRestoreActiveTab,
  ]);
}
