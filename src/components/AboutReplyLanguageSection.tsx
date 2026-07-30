/**
 * Title: Reply language section
 * Purpose: About-tab dropdown for overriding the AI reply language independent of Steam UI locale.
 * Used for: AboutTab below support links; pairs with backend reply-language prompt injection.
 * Solves: Exposes follow-system vs fixed-language choices with live effective-language helper text.
 * Does not: Translate plugin chrome — see i18n keys and steamLanguages re-exports.
 */
import React, { useMemo, useRef } from "react";
import { Dropdown, Focusable, PanelSection, PanelSectionRow } from "@decky/ui";
import {
  buildReplyLanguageDropdownOptions,
  REPLY_LANGUAGE_FOLLOW_SYSTEM,
  replyLanguageLabel,
  type ReplyLanguageId,
} from "../data/steamLanguages";
import { t as translate } from "../utils/i18n";

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

type Props = {
  replyLanguage: ReplyLanguageId;
  onReplyLanguageChange: (next: ReplyLanguageId) => void;
  effectiveLang: string;
  steamClientLanguageLabel: string;
  onMoveUp?: () => boolean;
  onMoveDown?: () => boolean;
};

export const AboutReplyLanguageSection: React.FC<Props> = ({
  replyLanguage,
  onReplyLanguageChange,
  effectiveLang,
  steamClientLanguageLabel,
  onMoveUp,
  onMoveDown,
}) => {
  const dropdownHostRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(() => buildReplyLanguageDropdownOptions(), []);
  const selected =
    options.find((o) => o.data === replyLanguage) ?? options[0]!;

  const sectionTitle = translate("about.replyLanguage.sectionTitle", effectiveLang);
  const dropdownLabel = translate("about.replyLanguage.dropdownLabel", effectiveLang);
  const hint = translate("about.replyLanguage.hint", effectiveLang);
  const systemLine =
    replyLanguage === REPLY_LANGUAGE_FOLLOW_SYSTEM
      ? translate("about.replyLanguage.systemDetected", effectiveLang, {
          name: steamClientLanguageLabel,
        })
      : null;

  return (
    <PanelSection title={sectionTitle}>
      <PanelSectionRow>
        <Focusable
          ref={dropdownHostRef}
          style={{ width: "100%" }}
          data-bonsai-about-language-dropdown="1"
          {...deckNav({
            onMoveUp: () => onMoveUp?.() ?? false,
            onMoveDown: () => onMoveDown?.() ?? false,
          })}
        >
          <div style={{ fontSize: 11, color: "#9fb7d5", lineHeight: 1.35, marginBottom: 8 }}>
            {hint}
          </div>
          {systemLine ? (
            <div style={{ fontSize: 11, color: "#9ce7ff", lineHeight: 1.35, marginBottom: 8 }}>
              {systemLine}
            </div>
          ) : null}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#dce8f4", marginBottom: 6 }}>
            {dropdownLabel}:{" "}
            <span style={{ color: "#9ce7ff" }}>{replyLanguageLabel(replyLanguage)}</span>
          </div>
          <Dropdown
            rgOptions={options}
            selectedOption={selected}
            onChange={(opt) => onReplyLanguageChange((opt.data as ReplyLanguageId) ?? REPLY_LANGUAGE_FOLLOW_SYSTEM)}
            strDefaultLabel={dropdownLabel}
          />
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
};
