/**
 * Title: Context chips from snapshot
 * Purpose: Derive sorted context chips and transparency UI availability from input transparency snapshots.
 * Used for: MainTab reply transparency strip and Show details entry points.
 * Solves: Consistent chip ordering, windowing, and gating for route/context disclosure UI.
 * Does not: Fetch transparency data — backend Ask status and inputTransparency types.
 */
import type { TransparencySnapshot, ContextChip, ContextChipBody } from "./inputTransparency";

export const CONTEXT_CHIP_WINDOW = 2;
/** When chip count is at or below this, show every pill (no sliding window). */
export const CONTEXT_CHIP_SHOW_ALL_MAX = 6;

export function chipsFromSnapshot(snapshot: TransparencySnapshot | null | undefined): ContextChip[] {
  if (!snapshot?.context_chips?.length) return [];
  return [...snapshot.context_chips].sort((a, b) => a.rank - b.rank);
}

/** True when transparency entry points (Show details, session strip, inline hint) should render. */
export function transparencyUiAvailable(snapshot: TransparencySnapshot | null | undefined): boolean {
  if (!snapshot?.route) return false;
  return chipsFromSnapshot(snapshot).length > 0 || snapshot.success === true;
}

export function windowRange(activeIndex: number, total: number, window = CONTEXT_CHIP_WINDOW) {
  const start = Math.max(0, activeIndex - window);
  const end = Math.min(total - 1, activeIndex + window);
  return { start, end };
}

export function chipBodyTitle(chip: ContextChip): string {
  return chip.body?.title || chip.label;
}

export function chipBodyBullets(chip: ContextChip): string[] {
  return chip.body?.bullets ?? [];
}

export function chipBodyPaths(chip: ContextChip): string[] {
  return chip.body?.paths ?? [];
}

export function chipDevJson(chip: ContextChip): unknown {
  return chip.body?.dev_json;
}

export function tierBorderColor(tierClass: string): string {
  if (tierClass === "foss") return "rgba(74, 222, 128, 0.9)";
  if (tierClass === "open_weight") return "rgba(251, 146, 60, 0.92)";
  if (tierClass === "non_foss") return "rgba(248, 113, 113, 0.92)";
  return "rgba(58, 76, 96, 0.85)";
}

export function tierBackground(tierClass: string): string {
  if (tierClass === "foss") return "rgba(18, 48, 32, 0.92)";
  if (tierClass === "open_weight") return "rgba(52, 32, 14, 0.92)";
  if (tierClass === "non_foss") return "rgba(48, 20, 24, 0.92)";
  return "rgba(26, 34, 44, 0.88)";
}

export type ContextChipBodyView = ContextChipBody;
