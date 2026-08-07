/**
 * Title: About tab
 * Purpose: Credits, support links, reply-language override, and third-party attribution panel.
 * Used for: About QAM tab from index.tsx with GitHub, Ollama, and PayPal support surfaces.
 * Solves: Groups non-settings informational content away from Settings and Ollama configuration tabs.
 * Does not: Change inference settings or model policy — see SettingsTab and OllamaTab for configuration.
 */
import React, { useRef } from "react";
import { ButtonItem, Focusable, Navigation, PanelSection, PanelSectionRow } from "@decky/ui";
import { toaster } from "@decky/api";
import { BONSAI_FOREST_GREEN } from "../features/unified-input/constants";
import supportPaypalQr from "../assets/qrcode.png";
import { AboutReplyLanguageSection } from "./AboutReplyLanguageSection";
import type { ReplyLanguageId } from "../data/replyLanguage";
import type { UiStringKey } from "../i18n/keys";

const PAYPAL_SUPPORT_URL = "https://paypal.me/quentind313";

type Props = {
  githubRepoUrl: string;
  ollamaRepoUrl: string;
  githubIssuesUrl: string;
  replyLanguage: ReplyLanguageId;
  onReplyLanguageChange: (next: ReplyLanguageId) => void;
  effectiveLang: string;
  steamClientLanguageLabel: string;
  t: (key: UiStringKey) => string;
};

/**
 * This tab explains plugin purpose/safety context and provides contributor support links.
 * It keeps project metadata and external navigation actions out of the main screen component.
 */
function openExternal(url: string, toastTitle: string) {
  try {
    Navigation.NavigateToExternalWeb(url);
  } catch {
    toaster.toast({ title: toastTitle, body: url, duration: 4000 });
  }
}

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

export const AboutTab: React.FC<Props> = ({
  githubRepoUrl,
  ollamaRepoUrl,
  githubIssuesUrl,
  replyLanguage,
  onReplyLanguageChange,
  effectiveLang,
  steamClientLanguageLabel,
  t: _t,
}) => {
  const githubBtnHostRef = useRef<HTMLDivElement | null>(null);
  const paypalBtnHostRef = useRef<HTMLDivElement | null>(null);
  const languageDropdownHostRef = useRef<HTMLDivElement | null>(null);

  const focusGithubBtn = () => {
    githubBtnHostRef.current?.focus();
    return true;
  };

  return (
    <>
      <PanelSection title="About bonsAI">
        <PanelSectionRow>
          <div style={{ fontSize: 12, color: "#c8c8c8", lineHeight: "1.2" }}>
            Backend Ollama Node for Steam (A.I.) - An AI assistant embedded in the
            Steam Deck Quick Access Menu. Ask questions, search settings, and get game-specific
            performance suggestions (TDP/GPU clock recommendations are read-only — apply them
            yourself in Steam&apos;s Performance tab if you choose).
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: 12, color: BONSAI_FOREST_GREEN, lineHeight: "1.2", fontWeight: 600, marginTop: "1.2em" }}>
            This plugin is in beta. AI-generated recommendations — especially TDP
            and performance changes — should be verified before relying on them.
            Use at your own risk!
          </div>
        </PanelSectionRow>
      </PanelSection>

      <AboutReplyLanguageSection
        replyLanguage={replyLanguage}
        onReplyLanguageChange={onReplyLanguageChange}
        effectiveLang={effectiveLang}
        steamClientLanguageLabel={steamClientLanguageLabel}
        dropdownHostRef={languageDropdownHostRef}
        onMoveUp={() => false}
        onMoveDown={focusGithubBtn}
      />

      <PanelSection title="Links">
        <PanelSectionRow>
          <Focusable
            ref={githubBtnHostRef}
            style={{ width: "100%" }}
            {...deckNav({
              onMoveUp: () => {
                languageDropdownHostRef.current?.focus();
                return true;
              },
              onMoveDown: () => {
                paypalBtnHostRef.current?.focus();
                return true;
              },
            })}
          >
            <ButtonItem layout="below" onClick={() => openExternal(githubRepoUrl, "GitHub")}>
              <span style={{ fontSize: 13 }}>GitHub</span>
            </ButtonItem>
          </Focusable>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => openExternal(ollamaRepoUrl, "Ollama")}>
            <span style={{ fontSize: 13 }}>Built on Ollama!</span>
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => openExternal(githubIssuesUrl, "Report a Bug")}>
            <span style={{ fontSize: 13 }}>Bugs & Feature Requests</span>
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 180,
                margin: "0 auto",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <Focusable ref={paypalBtnHostRef} style={{ width: "100%" }}>
                <ButtonItem layout="below" onClick={() => openExternal(PAYPAL_SUPPORT_URL, "PayPal")}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      textAlign: "center",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1.2 }}>Support my Steam Sale habit</span>
                    <img
                      src={supportPaypalQr}
                      alt="Support on PayPal — Support my Steam Sale habit"
                      style={{
                        display: "block",
                        width: 132,
                        maxWidth: "100%",
                        height: "auto",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                </ButtonItem>
              </Focusable>
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
