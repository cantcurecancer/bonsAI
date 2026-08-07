import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PermissionDenyAction } from "./PermissionDenyAction";

describe("PermissionDenyAction", () => {
  it("calls onJump with the capability when Open Permissions is pressed", () => {
    const onJump = vi.fn();
    render(
      <PermissionDenyAction
        capability="microphone_access"
        onJump={onJump}
      />,
    );
    fireEvent.click(screen.getByText("Open Permissions"));
    expect(onJump).toHaveBeenCalledWith("microphone_access");
  });

  it("renders a custom message when provided", () => {
    render(
      <PermissionDenyAction
        capability="filesystem_write"
        message="Custom deny copy."
        onJump={() => {}}
      />,
    );
    expect(screen.getByText("Custom deny copy.")).toBeTruthy();
  });
});
