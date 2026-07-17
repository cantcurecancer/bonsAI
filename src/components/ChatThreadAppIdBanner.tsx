import { Button, Focusable } from "@decky/ui";

export type ChatThreadAppIdBannerProps = {
  originAppId: string;
  currentAppId: string;
  onContinue: () => void;
  onNewThread: () => void;
};

export function ChatThreadAppIdBanner({
  originAppId,
  currentAppId,
  onContinue,
  onNewThread,
}: ChatThreadAppIdBannerProps) {
  return (
    <Focusable className="bonsai-chat-appid-banner">
      <div className="bonsai-chat-appid-banner-text">
        This chat started in another game (AppID {originAppId}). You are now in AppID {currentAppId}.
      </div>
      <div className="bonsai-chat-appid-banner-actions">
        <Button onClick={onContinue}>Continue</Button>
        <Button onClick={onNewThread}>New thread</Button>
      </div>
    </Focusable>
  );
}
