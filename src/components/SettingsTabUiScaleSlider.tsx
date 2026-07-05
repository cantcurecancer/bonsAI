import React, { useCallback, useMemo, useRef, useState } from "react";
import { Focusable } from "@decky/ui";
import {
  indexOfManualUiScaleProfile,
  manualUiScaleProfileAtIndex,
  UI_SCALE_MANUAL_PROFILE_IDS,
  UI_SCALE_PROFILE_DESCRIPTION,
  UI_SCALE_PROFILE_LABEL,
  type UiScaleProfileId,
} from "../data/uiScaleProfile";
import { isLeftNavigationKey, isRightNavigationKey } from "../utils/focusNavigation";

export type SettingsTabUiScaleSliderProps = {
  value: UiScaleProfileId;
  onChange: (next: UiScaleProfileId) => void;
  thumbHostRef?: React.Ref<HTMLDivElement>;
  onMoveUp?: () => boolean;
  onMoveDown?: () => boolean;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function indexToPct(index: number, maxIdx: number): number {
  if (maxIdx <= 0) return 50;
  return (index / maxIdx) * 100;
}

function pctToIndex(pct: number, maxIdx: number): number {
  return clamp(Math.round((clamp(pct, 0, 100) / 100) * maxIdx), 0, maxIdx);
}

type DeckNavProps = {
  onMoveLeft?: () => boolean | void;
  onMoveRight?: () => boolean | void;
  onMoveUp?: () => boolean | void;
  onMoveDown?: () => boolean | void;
  onButtonDown?: (button: unknown) => boolean | void;
};

function isLeftDeckButton(key: string): boolean {
  const lower = key.toLowerCase();
  return isLeftNavigationKey(key) || key === "GamepadLeftStickLeft" || lower.includes("left");
}

function isRightDeckButton(key: string): boolean {
  const lower = key.toLowerCase();
  return isRightNavigationKey(key) || key === "GamepadLeftStickRight" || lower.includes("right");
}

/** Three-stop snap slider: Handheld · Desktop · Couch. */
export function SettingsTabUiScaleSlider(props: SettingsTabUiScaleSliderProps) {
  const { value, onChange, thumbHostRef, onMoveUp, onMoveDown } = props;
  const maxIdx = UI_SCALE_MANUAL_PROFILE_IDS.length - 1;
  const index = indexOfManualUiScaleProfile(value);
  const thumbPct = useMemo(() => indexToPct(index, maxIdx), [index, maxIdx]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbWrapRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);

  const setIndex = useCallback(
    (nextIndex: number) => {
      onChange(manualUiScaleProfileAtIndex(nextIndex));
    },
    [onChange],
  );

  const pctFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return thumbPct;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return thumbPct;
    return ((clientX - rect.left) / rect.width) * 100;
  }, [thumbPct]);

  const onTrackPointerDown = useCallback(
    (ev: React.PointerEvent) => {
      ev.preventDefault();
      setDragging(true);
      setIndex(pctToIndex(pctFromClientX(ev.clientX), maxIdx));
      trackRef.current?.setPointerCapture(ev.pointerId);
    },
    [maxIdx, pctFromClientX, setIndex],
  );

  const onTrackPointerMove = useCallback(
    (ev: React.PointerEvent) => {
      if (!dragging) return;
      setIndex(pctToIndex(pctFromClientX(ev.clientX), maxIdx));
    },
    [dragging, maxIdx, pctFromClientX, setIndex],
  );

  const onTrackPointerUp = useCallback((ev: React.PointerEvent) => {
    setDragging(false);
    try {
      trackRef.current?.releasePointerCapture(ev.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const thumbNav: DeckNavProps = useMemo(
    () => ({
      onMoveLeft: () => {
        setIndex(index - 1);
        return true;
      },
      onMoveRight: () => {
        setIndex(index + 1);
        return true;
      },
      onMoveUp: () => onMoveUp?.() ?? false,
      onMoveDown: () => onMoveDown?.() ?? false,
      onButtonDown: (button: unknown) => {
        const key = String(button ?? "");
        if (isLeftDeckButton(key)) {
          setIndex(index - 1);
          return true;
        }
        if (isRightDeckButton(key)) {
          setIndex(index + 1);
          return true;
        }
        return false;
      },
    }),
    [index, onMoveDown, onMoveUp, setIndex],
  );

  const profileId = manualUiScaleProfileAtIndex(index);

  return (
    <div
      className="bonsai-ui-scale-slider"
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        className="bonsai-prose"
        style={{
          fontSize: 13,
          color: "#cdd9e6",
          lineHeight: 1.35,
          paddingLeft: 2,
        }}
      >
        Profile:{" "}
        <span style={{ color: "#9ce7ff", fontWeight: 700 }}>{UI_SCALE_PROFILE_LABEL[profileId]}</span>
      </div>
      <div
        style={{
          width: "100%",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.04)",
          padding: "14px 10px 10px 10px",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
          style={{ position: "relative", width: "100%", height: 34, touchAction: "none", cursor: "pointer" }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 14,
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.2)",
            }}
          />
          {UI_SCALE_MANUAL_PROFILE_IDS.map((id, i) => (
            <div
              key={id}
              aria-hidden
              style={{
                position: "absolute",
                left: `${indexToPct(i, maxIdx)}%`,
                top: 10,
                width: 2,
                height: 14,
                marginLeft: -1,
                background: "rgba(255,255,255,0.35)",
                pointerEvents: "none",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              width: `${thumbPct}%`,
              top: 14,
              height: 6,
              borderRadius: 999,
              background: "rgba(124, 214, 255, 0.45)",
              pointerEvents: "none",
            }}
          />
          <div
            ref={(el) => {
              thumbWrapRef.current = el;
              if (typeof thumbHostRef === "function") thumbHostRef(el);
              else if (thumbHostRef) (thumbHostRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            style={{
              position: "absolute",
              left: `calc(${thumbPct}% - 21px)`,
              top: 0,
              width: 42,
              height: 40,
              zIndex: 2,
            }}
          >
            <Focusable
              flow-children="vertical"
              {...(thumbNav as Record<string, unknown>)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 4,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: focused ? "#9ce7ff" : "#dce8f4",
                  border: dragging ? "2px solid #38bdf8" : "2px solid rgba(255,255,255,0.55)",
                  boxShadow: focused ? "0 0 0 2px rgba(56, 189, 248, 0.35)" : "none",
                }}
              />
            </Focusable>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 10,
            color: "#8fa0b4",
            fontWeight: 600,
            gap: 4,
          }}
        >
          {UI_SCALE_MANUAL_PROFILE_IDS.map((id) => (
            <span key={id} style={{ flex: 1, textAlign: "center" }}>
              {UI_SCALE_PROFILE_LABEL[id]}
            </span>
          ))}
        </div>
      </div>
      <div className="bonsai-prose" style={{ fontSize: 11, color: "#9fb7d5", lineHeight: 1.35 }}>
        {UI_SCALE_PROFILE_DESCRIPTION[profileId]}
      </div>
    </div>
  );
}
