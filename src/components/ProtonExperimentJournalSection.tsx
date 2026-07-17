import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Focusable,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { Router } from "@decky/ui";
import { toaster } from "@decky/api";
import { callDeckyWithTimeout, DECKY_RPC_TIMEOUT_MS, formatDeckyRpcError } from "../utils/deckyCall";
import { SETTINGS_GLASS_BTN, SETTINGS_GLASS_BTN_DANGER } from "../styles/settingsGlassButton";

export type ProtonJournalEntry = {
  id: string;
  proton_version: string;
  launch_options: string;
  outcome: "worse" | "same" | "better";
  note: string;
  created_at: number;
};

type Props = {
  attachProtonLogsWhenTroubleshooting: boolean;
  setAttachProtonLogsWhenTroubleshooting: (v: boolean) => void;
  includeProtonExperimentJournalWhenTroubleshooting: boolean;
  setIncludeProtonExperimentJournalWhenTroubleshooting: (v: boolean) => void;
  steamLogsReadEnabled: boolean;
  onBeforeDeckyModal?: () => void;
  onMoveUpFromSection?: () => boolean;
  onMoveDownFromSection?: () => boolean;
};

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

const OUTCOME_OPTIONS = [
  { data: "worse", label: "Worse" },
  { data: "same", label: "Same" },
  { data: "better", label: "Better" },
];

export const ProtonExperimentJournalSection: React.FC<Props> = ({
  attachProtonLogsWhenTroubleshooting,
  setAttachProtonLogsWhenTroubleshooting,
  includeProtonExperimentJournalWhenTroubleshooting,
  setIncludeProtonExperimentJournalWhenTroubleshooting,
  steamLogsReadEnabled,
  onMoveUpFromSection,
  onMoveDownFromSection,
}) => {
  const runningAppId = Router.MainRunningApp?.appid?.toString() ?? "";
  const [manualAppId, setManualAppId] = useState(runningAppId);
  const [entries, setEntries] = useState<ProtonJournalEntry[]>([]);
  const [protonVersion, setProtonVersion] = useState("");
  const [launchOptions, setLaunchOptions] = useState("%command%");
  const [outcome, setOutcome] = useState<"worse" | "same" | "better">("same");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveAppId = (manualAppId || runningAppId).trim();

  const refreshEntries = useCallback(async () => {
    if (!effectiveAppId || !/^\d+$/.test(effectiveAppId)) {
      setEntries([]);
      return;
    }
    try {
      const res = await callDeckyWithTimeout<[string], { entries?: ProtonJournalEntry[] }>(
        "get_proton_experiment_journal",
        [effectiveAppId],
        DECKY_RPC_TIMEOUT_MS,
      );
      setEntries(Array.isArray(res?.entries) ? res.entries : []);
    } catch {
      setEntries([]);
    }
  }, [effectiveAppId]);

  useEffect(() => {
    void refreshEntries();
  }, [refreshEntries]);

  useEffect(() => {
    if (runningAppId && !manualAppId) setManualAppId(runningAppId);
  }, [runningAppId, manualAppId]);

  const onSuggestFromLog = async () => {
    if (!steamLogsReadEnabled) {
      toaster.toast({
        title: "Permission required",
        body: "Enable Steam/Proton log read in Permissions.",
        duration: 4000,
      });
      return;
    }
    if (!effectiveAppId) return;
    try {
      const res = await callDeckyWithTimeout<[string], { ok?: boolean; hint?: string }>(
        "suggest_proton_journal_version_from_log",
        [effectiveAppId],
        DECKY_RPC_TIMEOUT_MS,
      );
      if (res?.hint?.trim()) setProtonVersion(res.hint.trim());
      else toaster.toast({ title: "No hint", body: "Could not parse Proton version from log.", duration: 3500 });
    } catch (e: unknown) {
      toaster.toast({ title: "Suggest failed", body: formatDeckyRpcError(e), duration: 4000 });
    }
  };

  const onAddEntry = async () => {
    if (!effectiveAppId || !protonVersion.trim()) {
      toaster.toast({ title: "Missing fields", body: "AppID and Proton version required.", duration: 3500 });
      return;
    }
    setLoading(true);
    try {
      const res = await callDeckyWithTimeout<
        [Record<string, unknown>],
        { ok?: boolean; entries?: ProtonJournalEntry[]; error?: string }
      >(
        "save_proton_experiment_journal_entry",
        [
          {
            app_id: effectiveAppId,
            proton_version: protonVersion.trim(),
            launch_options: launchOptions.trim() || "%command%",
            outcome,
            note: note.trim(),
          },
        ],
        DECKY_RPC_TIMEOUT_MS,
      );
      if (!res?.ok) {
        toaster.toast({ title: "Save failed", body: res?.error ?? "Unknown error", duration: 4000 });
        return;
      }
      setEntries(Array.isArray(res.entries) ? res.entries : []);
      setProtonVersion("");
      setNote("");
      toaster.toast({ title: "Saved", body: "Experiment entry added.", duration: 2500 });
    } catch (e: unknown) {
      toaster.toast({ title: "Save failed", body: formatDeckyRpcError(e), duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const onDeleteEntry = async (entryId: string) => {
    try {
      const res = await callDeckyWithTimeout<
        [Record<string, unknown>],
        { ok?: boolean; entries?: ProtonJournalEntry[] }
      >(
        "delete_proton_experiment_journal_entry",
        [{ app_id: effectiveAppId, entry_id: entryId }],
        DECKY_RPC_TIMEOUT_MS,
      );
      if (res?.ok) setEntries(Array.isArray(res.entries) ? res.entries : []);
    } catch (e: unknown) {
      toaster.toast({ title: "Delete failed", body: formatDeckyRpcError(e), duration: 4000 });
    }
  };

  const onClearGame = async () => {
    try {
      await callDeckyWithTimeout("clear_proton_experiment_journal", [effectiveAppId], DECKY_RPC_TIMEOUT_MS);
      setEntries([]);
      toaster.toast({ title: "Cleared", body: "Journal entries removed for this AppID.", duration: 3000 });
    } catch (e: unknown) {
      toaster.toast({ title: "Clear failed", body: formatDeckyRpcError(e), duration: 4000 });
    }
  };

  return (
    <PanelSection title="Proton troubleshooting">
      <PanelSectionRow>
        <div className="bonsai-settings-bleed" style={{ width: "100%" }}>
          <ToggleField
            label="Attach Proton logs on troubleshooting Asks"
            description="When enabled (and Steam/Proton log read is on), troubleshooting-style questions include bounded local log excerpts."
            checked={attachProtonLogsWhenTroubleshooting}
            onChange={(checked) => setAttachProtonLogsWhenTroubleshooting(checked)}
          />
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div className="bonsai-settings-bleed" style={{ width: "100%" }}>
          <ToggleField
            label="Inject experiment journal on troubleshooting Asks"
            description="Includes your per-game Proton attempt timeline so the model avoids re-suggesting dead ends."
            checked={includeProtonExperimentJournalWhenTroubleshooting}
            onChange={(checked) => setIncludeProtonExperimentJournalWhenTroubleshooting(checked)}
          />
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <Focusable
          style={{ width: "100%" }}
          {...deckNav({
            onMoveUp: () => onMoveUpFromSection?.() ?? false,
            onMoveDown: () => onMoveDownFromSection?.() ?? false,
          })}
        >
          <div style={{ fontSize: 11, color: "#9fb7d5", marginBottom: 6, lineHeight: 1.35 }}>
            Journal file: <span style={{ color: "#9ce7ff" }}>~/.bonsai/proton_experiment_journal.json</span>
            {runningAppId ? ` · Running game AppID ${runningAppId}` : ""}
          </div>
          <TextField label="AppID" value={manualAppId} onChange={(e) => setManualAppId(e.target.value.replace(/\D/g, "").slice(0, 12))} />
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#dce8f4" }}>Add experiment</div>
          <TextField label="Proton version" value={protonVersion} onChange={(e) => setProtonVersion(e.target.value.slice(0, 80))} />
          <div style={{ marginTop: 6 }}>
            <Button
              disabled={!steamLogsReadEnabled}
              onClick={() => void onSuggestFromLog()}
              style={{ minHeight: 32, fontSize: 11 }}
            >
              Suggest from log
            </Button>
          </div>
          <div style={{ marginTop: 6 }}>
            <TextField label="Launch options" value={launchOptions} onChange={(e) => setLaunchOptions(e.target.value.slice(0, 512))} />
          </div>
          <div style={{ marginTop: 6 }}>
            <Dropdown
              rgOptions={OUTCOME_OPTIONS}
              selectedOption={OUTCOME_OPTIONS.find((o) => o.data === outcome) ?? OUTCOME_OPTIONS[1]}
              onChange={(opt) => setOutcome((opt.data as "worse" | "same" | "better") ?? "same")}
              strDefaultLabel="Outcome"
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value.slice(0, 120))} />
          </div>
          <div style={{ marginTop: 8 }}>
            <Focusable onOKButton={() => void onAddEntry()}>
              <Button disabled={loading} onClick={() => void onAddEntry()} style={SETTINGS_GLASS_BTN}>
                Add entry
              </Button>
            </Focusable>
          </div>
        </Focusable>
      </PanelSectionRow>
      {entries.length > 0 ? (
        <PanelSectionRow>
          <div style={{ width: "100%", fontSize: 11, color: "#dce8f4" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Entries (newest first)</div>
            {entries.map((entry) => (
              <Focusable
                key={entry.id}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <div>
                  <strong>{entry.proton_version}</strong> · {entry.outcome}
                </div>
                <div style={{ color: "#9fb7d5", marginTop: 2 }}>{entry.launch_options}</div>
                {entry.note ? <div style={{ marginTop: 2 }}>{entry.note}</div> : null}
                <Button onClick={() => void onDeleteEntry(entry.id)} style={{ ...SETTINGS_GLASS_BTN_DANGER, marginTop: 6, minHeight: 28, fontSize: 10 }}>
                  Delete
                </Button>
              </Focusable>
            ))}
            <Button onClick={() => void onClearGame()} style={{ ...SETTINGS_GLASS_BTN_DANGER, width: "100%", minHeight: 32 }}>
              Clear journal for this AppID
            </Button>
          </div>
        </PanelSectionRow>
      ) : null}
    </PanelSection>
  );
};
