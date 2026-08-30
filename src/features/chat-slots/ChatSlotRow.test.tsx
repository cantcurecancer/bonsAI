import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { ChatSlotRow } from "./ChatSlotRow";
import type { ChatSlotSummary } from "../../utils/chatSlotsApi";

/*
 * `@decky/ui`'s Focusable has to render as a real DOM node here — see
 * src/test-harness/fakeDeckyUi.tsx. This suite only asserts which class each dot and spark gets
 * for a given generating/unread state; the D-pad and bumper paths the stub strips stay on device
 * (CHAT-SLOTS-V3-06a/b/c).
 */
vi.mock("@decky/ui", async () => import("../../test-harness/fakeDeckyUi"));

function summary(id: string, label: string): ChatSlotSummary {
  return { id, label, created_at: 0, updated_at: 0 };
}

/* useMemo reverses `summaries`, so this renders as slot-c, slot-b, slot-a. */
const SUMMARIES = [summary("a", "Alpha"), summary("b", "Beta"), summary("c", "Gamma")];

function renderRow(overrides: Partial<React.ComponentProps<typeof ChatSlotRow>> = {}) {
  return render(
    <ChatSlotRow
      summaries={SUMMARIES}
      activeSlotId="b"
      onCreateSlot={async () => undefined}
      onSelectSlot={async () => undefined}
      onRenameSlot={async () => true}
      onDeleteSlot={async () => true}
      {...overrides}
    />,
  );
}

function dotClasses(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll(".bonsai-chat-slot-dot")).map((el) => el.className);
}

describe("ChatSlotRow dot language", () => {
  it("marks only the active slot when nothing is generating or unread", () => {
    const { container } = renderRow();
    const classes = dotClasses(container);
    expect(classes).toHaveLength(3);
    expect(classes.filter((c) => c.includes("--active"))).toHaveLength(1);
    expect(classes.some((c) => c.includes("--pending"))).toBe(false);
    expect(classes.some((c) => c.includes("--unread"))).toBe(false);
  });

  it("gives the generating slot the pending ring", () => {
    const { container } = renderRow({ generatingSlotId: "a" });
    expect(dotClasses(container).filter((c) => c.includes("--pending"))).toHaveLength(1);
  });

  it("gives a finished-while-away slot the unread dot", () => {
    const { container } = renderRow({ unreadSlotIds: new Set(["c"]) });
    expect(dotClasses(container).filter((c) => c.includes("--unread"))).toHaveLength(1);
  });

  it("lets pending win when a slot is somehow both", () => {
    const { container } = renderRow({ generatingSlotId: "a", unreadSlotIds: new Set(["a"]) });
    const classes = dotClasses(container);
    expect(classes.filter((c) => c.includes("--pending"))).toHaveLength(1);
    expect(classes.some((c) => c.includes("--unread"))).toBe(false);
  });

  it("draws a spark beside a ghost neighbour that is generating", () => {
    const { container } = renderRow({ generatingSlotId: "c" });
    const sparks = container.querySelectorAll(".bonsai-chat-slot-ghost-spark");
    expect(sparks).toHaveLength(1);
    expect(sparks[0].className).toContain("--pending");
  });

  it("draws no spark for a quiet ghost neighbour", () => {
    const { container } = renderRow();
    expect(container.querySelectorAll(".bonsai-chat-slot-ghost-spark")).toHaveLength(0);
  });
});
