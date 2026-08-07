/**
 * Geometry guard for the shared bonsai trunk/pot path in tab and plugin-list icons.
 * Canopy bbox center is 11.5 on the 24-unit viewBox; pot/trunk must match (roadmap Wave 1 D).
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BonsaiSvgIcon, BonsaiTreeTabIcon } from "./icons";

/** Documented corrected path: pot/trunk shifted 0.5 left so rim/base center aligns with canopy. */
const BONSAI_TRUNK_POT_PATH = "M11.5 14.5v3.2m-4.8 0h9.6l-1.1 2.3H7.8l-1.1-2.3Z";

function trunkPotPath(container: HTMLElement): string | null {
  const paths = container.querySelectorAll("svg path");
  return paths.length >= 2 ? paths[1].getAttribute("d") : null;
}

describe("bonsai icon trunk/pot geometry", () => {
  it("BonsaiTreeTabIcon uses canopy-aligned trunk/pot path", () => {
    const { container } = render(<BonsaiTreeTabIcon size={36} />);
    expect(trunkPotPath(container)).toBe(BONSAI_TRUNK_POT_PATH);
  });

  it("BonsaiSvgIcon uses the same trunk/pot path", () => {
    const { container } = render(<BonsaiSvgIcon size={26} />);
    expect(trunkPotPath(container)).toBe(BONSAI_TRUNK_POT_PATH);
  });
});
