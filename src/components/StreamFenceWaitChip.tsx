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
