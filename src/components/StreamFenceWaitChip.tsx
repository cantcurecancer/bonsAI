/**
 * Title: Stream fence wait chip
 * Purpose: Show a pulsing status chip while streaming markdown is inside an open code fence or spoiler mask.
 * Used for: MainTabChatTranscript during in-flight assistant replies (F2 fence / S1 spoiler variants).
 * Solves: Gives visible feedback that the model is still writing inside a fenced or masked block.
 * Does not: Parse markdown, close fences, or manage stream state — parent owns streaming lifecycle.
 */
export type StreamFenceWaitChipProps = {
  label: string;
  kind: "fence" | "spoiler";
  pulseBubble?: boolean;
};

/**
 * Pulse + spinner while a code fence is open (F2). Spoiler variant uses mask copy only (S1).
 */
export function StreamFenceWaitChip(props: StreamFenceWaitChipProps) {
  const { label, kind } = props;
  const isFence = kind === "fence";

  return (
    <div
      className={`bonsai-stream-fence-wait${isFence ? " bonsai-stream-fence-wait--code" : " bonsai-stream-fence-wait--spoiler"}`}
      data-bonsai-stream-wait={kind}
      role="status"
    >
      {isFence ? <span className="bonsai-stream-fence-wait-spin" aria-hidden /> : null}
      <span className="bonsai-stream-fence-wait-label">{label}</span>
    </div>
  );
}
