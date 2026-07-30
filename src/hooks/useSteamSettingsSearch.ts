/**
 * Title: Steam settings search hook
 * Purpose: Filter Steam/QAM settings rows from unified input and deep-link via Router or steam:// URLs.
 * Used for: MainTab search mode and SETTINGS_DATABASE navigation.
 * Solves: Intent-pack-augmented settings discovery from the unified Ask bar.
 * Does not: Own intent pack data — see useIntentPacks and intentPackSearch.
 */
import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import { toaster } from "@decky/api";
import { Navigation } from "@decky/ui";
import { SETTINGS_DATABASE } from "../data/settingsDatabase";
import { getQamTab, getSteamSettingsUrl, isQamSetting } from "../data/steamSettingsNavigation";
import { searchSettingsWithIntentPacks } from "../utils/intentPackSearch";
import type { IntentPackSearchIndex } from "../utils/intentPackSearch";

type SteamUrlApi = {
  ExecuteSteamURL(url: string): void;
};

export type UseSteamSettingsSearchOptions = {
  unifiedInput: string;
  intentPackIndex: IntentPackSearchIndex;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  setNavigationMessage: Dispatch<SetStateAction<string>>;
};

export function useSteamSettingsSearch({
  unifiedInput,
  intentPackIndex,
  setSelectedIndex,
  setNavigationMessage,
}: UseSteamSettingsSearchOptions) {
  const filteredSettings = useMemo(() => {
    return searchSettingsWithIntentPacks(unifiedInput, SETTINGS_DATABASE, intentPackIndex);
  }, [unifiedInput, intentPackIndex]);

  const onSettingClick = useCallback(
    (settingPath: string, index?: number) => {
      if (index !== undefined) setSelectedIndex(index);
      try {
        if (isQamSetting(settingPath)) {
          const qamTab = getQamTab(settingPath);
          Navigation.OpenQuickAccessMenu(qamTab);
          toaster.toast({ title: "Opening QAM", body: settingPath, duration: 2000 });
          setNavigationMessage(`Opened QAM: ${settingPath}`);
          return;
        }

        const steamUrlApi = SteamClient.URL as unknown as SteamUrlApi;
        const steamUrl = getSteamSettingsUrl(settingPath);
        steamUrlApi.ExecuteSteamURL(steamUrl);
        toaster.toast({ title: "Opening settings", body: settingPath, duration: 2000 });
        setNavigationMessage(`Opened: ${settingPath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toaster.toast({ title: "Navigation failed", body: message, duration: 3000 });
        setNavigationMessage(`Navigation failed: ${message}`);
      }
    },
    [setSelectedIndex, setNavigationMessage],
  );

  return { filteredSettings, onSettingClick };
}
