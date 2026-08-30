/**
 * Title: Chat slot modal stylesheet
 * Purpose: Body styling for the chat-slot rename modal inside Steam's stock ConfirmModal shell.
 * Used for: buildModalPortalStylesheet — injected under `.bonsai-scope` in showModal portals.
 * Solves: A readable, on-brand slot-name field without touching Steam's dialog chrome.
 * Does not: Style the modal shell, footer or buttons — decision 8d keeps those stock.
 */

/**
 * Plain px, not `uiScalePx`: the modal portal renders in Steam's dialog at Steam's own scale,
 * outside the QAM column, and `BonsaiModalScope` handles the UI-scale vars itself.
 */
export function buildChatSlotModalStylesheet(): string {
  return `
        .bonsai-scope .bonsai-chat-slot-modal-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(143, 168, 196, 0.8);
          margin-bottom: 6px;
          text-align: left;
        }
        .bonsai-scope .bonsai-chat-slot-modal-field input {
          height: 36px;
          border-radius: 8px;
          background: rgba(18, 26, 34, 0.55);
          border: 1px solid rgba(156, 231, 255, 0.5);
          box-shadow: 0 0 10px rgba(156, 231, 255, 0.12);
          font-size: 14px;
          font-weight: 600;
          color: #e8eef5;
          caret-color: #9ce7ff;
        }
  `;
}
