import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { DrgGlossaryTermChip } from "./DrgGlossaryTermChip";
import { DRG_SURVIVOR_GLOSSARY_TERMS } from "../data/drgGlossaryTerms";
import { composeDrgGlossaryExplainFurtherQuestion } from "../utils/drgGlossaryAsk";

/*
 * `@decky/ui`'s `Focusable` has to render as a real DOM node with a working `ref`, or this suite
 * would pass for the wrong reason — see src/test-harness/fakeDeckyUi.tsx. onFocus/onBlur/onClick are
 * plain DOM handlers the stub does not strip, so peek/full/explain-further are all reachable through
 * ordinary fireEvent calls; only the real Steam A/B/D-pad path (onActivate/onButtonDown, stripped by
 * the stub) needs the device, per the roadmap's D-pad QA rows.
 */
vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

const kitingTerm = DRG_SURVIVOR_GLOSSARY_TERMS.find((t) => t.id === "kiting")!;

describe("DrgGlossaryTermChip", () => {
  it("renders the matched text with no tooltip while idle", () => {
    const { container } = render(<DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" />);
    expect(container.textContent).toContain("kiting");
    expect(container.querySelector(".bonsai-drg-glossary-tooltip")).toBeNull();
  });

  it("shows the short peek on focus alone, with no action needed", () => {
    const { container } = render(<DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" />);
    const chip = container.querySelector(".bonsai-drg-glossary-term") as HTMLElement;
    fireEvent.focus(chip);
    const tooltip = container.querySelector(".bonsai-drg-glossary-tooltip");
    expect(tooltip?.textContent).toBe(kitingTerm.peek);
  });

  it("clears the peek on blur", () => {
    const { container } = render(<DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" />);
    const chip = container.querySelector(".bonsai-drg-glossary-term") as HTMLElement;
    fireEvent.focus(chip);
    fireEvent.blur(chip);
    expect(container.querySelector(".bonsai-drg-glossary-tooltip")).toBeNull();
  });

  it("opens the full definition, with an explain-further chip, when the term is activated", () => {
    const { container } = render(<DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" />);
    const chip = container.querySelector(".bonsai-drg-glossary-term") as HTMLElement;
    fireEvent.focus(chip);
    fireEvent.click(container.querySelector(".bonsai-drg-glossary-term-text")!);
    const tooltip = container.querySelector(".bonsai-drg-glossary-tooltip");
    expect(tooltip?.textContent).toContain(kitingTerm.full);
    expect(container.querySelector(".bonsai-drg-glossary-explain-further")).toBeTruthy();
  });

  it("explain-further calls back with the term and composes the right Ask text", () => {
    const onExplainFurther = vi.fn();
    const { container } = render(
      <DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" onExplainFurther={onExplainFurther} />
    );
    fireEvent.click(container.querySelector(".bonsai-drg-glossary-term-text")!);
    fireEvent.click(container.querySelector(".bonsai-drg-glossary-explain-further")!);
    expect(onExplainFurther).toHaveBeenCalledTimes(1);
    expect(onExplainFurther).toHaveBeenCalledWith(kitingTerm);
    const question = composeDrgGlossaryExplainFurtherQuestion(onExplainFurther.mock.calls[0][0]);
    expect(question).toContain("kiting");
    expect(question).toContain("Deep Rock Galactic: Survivor");
  });

  it("closes the tooltip after explain-further is used", () => {
    const { container } = render(
      <DrgGlossaryTermChip term={kitingTerm} matchedText="kiting" onExplainFurther={vi.fn()} />
    );
    fireEvent.click(container.querySelector(".bonsai-drg-glossary-term-text")!);
    fireEvent.click(container.querySelector(".bonsai-drg-glossary-explain-further")!);
    expect(container.querySelector(".bonsai-drg-glossary-tooltip")).toBeNull();
  });
});
