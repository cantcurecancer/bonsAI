/**
 * Title: Voice Ask input
 * Purpose: Own the mic button's state machine — start, stop, permission gate, and error toasts.
 * Used for: index.tsx, which passes `voiceRecording` and `onMicInput` down to the Main tab.
 * Solves: Keeps recording state and its capability/teardown rules out of the plugin shell.
 * Does not: Transcribe — that is useVoiceTranscription and the backend Whisper daemon.
 */
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toaster } from "@decky/api";

import { formatDeckyRpcError } from "../../utils/deckyCall";
import { useVoiceTranscription } from "../../hooks/useVoiceTranscription";
import type { UiStringVars } from "../../i18n/catalog";
import type { UiStringKey } from "../../i18n/keys";

export type UseVoiceAskInputArgs = {
  /** Transcribed text is written straight into the unified Ask field. */
  setUnifiedInput: Dispatch<SetStateAction<string>>;
  /** Seed text so a restart appends rather than replaces. */
  unifiedInput: string;
  /** Recording is refused, and any in-flight session torn down, without this. */
  microphoneAccess: boolean;
  /** The mic is inert while an Ask is running. */
  isAsking: boolean;
  /** Send the user somewhere they can grant the permission they just hit. */
  goToPermissionsTab: () => void;
  /** Localised copy for the transcription-failure toast. */
  uiT: (key: UiStringKey, vars?: UiStringVars) => string;
};

export function useVoiceAskInput(a: UseVoiceAskInputArgs) {
  const [voiceRecording, setVoiceRecording] = useState(false);

  const onVoiceError = useCallback(
    (e: unknown) => {
      setVoiceRecording(false);
      toaster.toast({
        title: a.uiT("toast.voiceInputError.title"),
        body: formatDeckyRpcError(e),
        duration: 5000,
      });
    },
    [a.uiT],
  );

  const { startVoiceTranscription, stopVoiceTranscription, invalidateVoice } = useVoiceTranscription(
    a.setUnifiedInput,
    onVoiceError,
  );

  // Revoking mic access mid-recording must stop the session, not just hide the button.
  useEffect(() => {
    if (!a.microphoneAccess && voiceRecording) {
      void stopVoiceTranscription();
      invalidateVoice();
      setVoiceRecording(false);
    }
  }, [a.microphoneAccess, voiceRecording, stopVoiceTranscription, invalidateVoice]);

  const onMicInput = useCallback(() => {
    if (a.isAsking) return;
    if (voiceRecording) {
      setVoiceRecording(false);
      void stopVoiceTranscription();
      return;
    }
    if (!a.microphoneAccess) {
      toaster.toast({
        title: "Permission required",
        body: "Enable Voice input (microphone) in the Permissions tab to use speech-to-text.",
        duration: 4500,
      });
      a.goToPermissionsTab();
      return;
    }
    void startVoiceTranscription(a.unifiedInput)
      .then(() => setVoiceRecording(true))
      .catch((e: unknown) => {
        setVoiceRecording(false);
        toaster.toast({
          title: "Voice input unavailable",
          body: e instanceof Error ? e.message : formatDeckyRpcError(e),
          duration: 5500,
        });
      });
  }, [
    a.isAsking,
    voiceRecording,
    a.microphoneAccess,
    a.goToPermissionsTab,
    startVoiceTranscription,
    stopVoiceTranscription,
    a.unifiedInput,
  ]);

  return { voiceRecording, onMicInput, stopVoiceTranscription, invalidateVoice };
}
