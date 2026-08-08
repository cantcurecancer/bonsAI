/**
 * Title: Reply language section
 * Purpose: About-tab dropdown for overriding the AI reply language independent of Steam UI locale.
 * Used for: AboutTab below support links; pairs with backend reply-language prompt injection.
 * Solves: Exposes follow-system vs fixed-language choices with live effective-language helper text.
 * Does not: Translate plugin chrome — see i18n keys and steamLanguages re-exports.
 */
import React, { useMemo } from "react";
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
  dropdownHostRef?: React.Ref<HTMLDivElement>;
};

export const AboutReplyLanguageSection: React.FC<Props> = ({
  replyLanguage,
  onReplyLanguageChange,
  effectiveLang,
  steamClientLanguageLabel,
  onMoveUp,
  onMoveDown,
  dropdownHostRef,
}) => {
  const options = useMemo(() => buildReplyLanguageDropdownOptions(), []);
  // Decky Dropdown matches selectedOption against each option's `.data`, not the full option object.
  const selectedOption = replyLanguage;

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
          ref={(el: HTMLDivElement | null) => {
            if (typeof dropdownHostRef === "function") dropdownHostRef(el);
            else if (dropdownHostRef) (dropdownHostRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
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
            selectedOption={selectedOption}
            onChange={(opt) => onReplyLanguageChange((opt.data as ReplyLanguageId) ?? REPLY_LANGUAGE_FOLLOW_SYSTEM)}
            strDefaultLabel={dropdownLabel}
          />
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
};
