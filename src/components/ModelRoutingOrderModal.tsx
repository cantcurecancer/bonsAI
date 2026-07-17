import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Focusable } from "@decky/ui";
import type { ModelPolicyTierId } from "../data/modelPolicy";
import type { PullModelEntry } from "../data/pullModelCatalog";
import { BonsaiModalScope } from "./BonsaiModalScope";
import {
  buildPickerOrder,
  DEFAULT_TEXT_ROUTING_SEED,
  DEFAULT_VISION_ROUTING_SEED,
  isHighVramTag,
  isVisionCapableTag,
  licenseClassAllowed,
} from "../utils/modelRoutingOrder";

export type ModelRoutingOrderKind = "text" | "vision";

export type ModelRoutingOrderModalProps = {
  kind: ModelRoutingOrderKind;
  installedTags: string[];
  catalogByTag: Map<string, PullModelEntry>;
  modelPolicyTier: ModelPolicyTierId;
  modelPolicyNonFossUnlocked: boolean;
  modelAllowHighVramFallbacks: boolean;
  savedOrder: string[];
  onSave: (order: string[]) => void | Promise<void>;
  onClose: () => void;
};

type RowMeta = {
  tag: string;
  tierBlocked: boolean;
  highVramInactive: boolean;
  visionUnknown: boolean;
  sizeGb?: number;
};

export function ModelRoutingOrderModal({
  kind,
  installedTags,
  catalogByTag,
  modelPolicyTier,
  modelPolicyNonFossUnlocked,
  modelAllowHighVramFallbacks,
  savedOrder,
  onSave,
  onClose,
}: ModelRoutingOrderModalProps) {
  const initial = useMemo(
    () => buildPickerOrder(kind, installedTags, savedOrder),
    [kind, installedTags, savedOrder],
  );
  const [order, setOrder] = useState<string[]>(initial);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  const rows: RowMeta[] = useMemo(
    () =>
      order.map((tag) => {
        const entry = catalogByTag.get(tag);
        const sizeGb = entry?.sizeGb;
        const tierBlocked = !licenseClassAllowed(
          entry?.licenseClass,
          modelPolicyTier,
          modelPolicyNonFossUnlocked,
        );
        const highVramInactive =
          !modelAllowHighVramFallbacks && isHighVramTag(tag, sizeGb);
        const visionUnknown =
          kind === "vision" && !entry?.tags.includes("vision") && isVisionCapableTag(tag, entry);
        return { tag, tierBlocked, highVramInactive, visionUnknown, sizeGb };
      }),
    [order, catalogByTag, modelPolicyTier, modelPolicyNonFossUnlocked, modelAllowHighVramFallbacks, kind],
  );

  const move = useCallback((index: number, delta: number) => {
    setOrder((prev) => {
      const next = index + delta;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[next];
      copy[next] = tmp;
      return copy;
    });
  }, []);

  const onReset = useCallback(() => {
    const seed = kind === "vision" ? DEFAULT_VISION_ROUTING_SEED : DEFAULT_TEXT_ROUTING_SEED;
    const instSet = new Set(installedTags);
    const head = seed.filter((t) => instSet.has(t));
    let tail = installedTags.filter((t) => !head.includes(t));
    if (kind === "vision") tail = tail.filter((t) => isVisionCapableTag(t, catalogByTag.get(t)));
    setOrder([...head, ...tail]);
  }, [kind, installedTags, catalogByTag]);

  const title = kind === "vision" ? "Vision model try order" : "Text model try order";

  return (
    <BonsaiModalScope className="bonsai-model-routing-modal">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, textAlign: "left" }}>
        <div className="bonsai-prose" style={{ fontSize: 13, fontWeight: 600, color: "#e8f0ff" }}>
          {title}
        </div>
        <div className="bonsai-prose" style={{ fontSize: 11, color: "#9fb7d5", lineHeight: 1.4 }}>
          Installed models only. Move up/down to set try order. Grayed models stay in the list but are skipped at Ask
          time when blocked by tier or high-VRAM policy.
        </div>
        <Focusable
          className="bonsai-model-routing-list"
          flow-children="vertical"
          style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "52vh", overflowY: "auto" }}
        >
          {rows.map((row, index) => {
            const inactive = row.tierBlocked || row.highVramInactive;
            return (
              <Focusable
                key={row.tag}
                className="bonsai-model-routing-row"
                flow-children="horizontal"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  opacity: inactive ? 0.55 : 1,
                  background: "rgba(255,255,255,0.04)",
                }}
                {...({
                  ref: (el: HTMLElement | null) => {
                    rowRefs.current[index] = el;
                  },
                  onMoveUp: () => {
                    if (index > 0) {
                      move(index, -1);
                      rowRefs.current[index - 1]?.focus();
                      return true;
                    }
                    return false;
                  },
                  onMoveDown: () => {
                    if (index < rows.length - 1) {
                      move(index, 1);
                      rowRefs.current[index + 1]?.focus();
                      return true;
                    }
                    return false;
                  },
                } as Record<string, unknown>)}
              >
                <span style={{ flex: 1, fontSize: 12, color: "#e2e8f0", minWidth: 0, wordBreak: "break-word" }}>
                  {row.tag}
                </span>
                {row.tierBlocked ? (
                  <span style={{ fontSize: 10, color: "#f0b4b4" }}>Tier blocked</span>
                ) : null}
                {row.highVramInactive ? (
                  <span style={{ fontSize: 10, color: "#c9b896" }}>High VRAM off</span>
                ) : null}
                {row.visionUnknown ? (
                  <span style={{ fontSize: 10, color: "#9fb7d5" }}>Vision unverified</span>
                ) : null}
                <Button
                  className="bonsai-chat-secondary-btn"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Move ${row.tag} up`}
                >
                  Up
                </Button>
                <Button
                  className="bonsai-chat-secondary-btn"
                  disabled={index >= rows.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move ${row.tag} down`}
                >
                  Down
                </Button>
              </Focusable>
            );
          })}
        </Focusable>
        <Focusable className="bonsai-model-routing-footer" flow-children="horizontal" style={{ display: "flex", gap: 8 }}>
          <Button className="bonsai-chat-secondary-btn" onClick={onReset}>
            Reset to defaults
          </Button>
          <Button
            onClick={() => {
              void Promise.resolve(onSave(order)).then(() => onClose());
            }}
          >
            Done
          </Button>
          <Button className="bonsai-chat-secondary-btn" onClick={onClose}>
            Cancel
          </Button>
        </Focusable>
      </div>
    </BonsaiModalScope>
  );
}
