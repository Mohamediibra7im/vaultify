import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/confirm-dialog";

vi.mock("motion/react", () => {
  const React = require("react");
  const motion = new Proxy(
    {},
    {
      get: (_target: unknown, tag: string) =>
        React.forwardRef(
          ({ children, ...props }: Record<string, unknown>, _ref: unknown) =>
            React.createElement(tag as string, props, children),
        ),
    },
  );
  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    children;
  return { motion, AnimatePresence };
});

describe("ConfirmDialog", () => {
  it("renders title and description", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Secret"
        description="This action cannot be undone."
      />,
    );
    expect(screen.getByText("Delete Secret")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirmed", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Delete Secret"
        description="Are you sure?"
        confirmLabel="Delete"
      />,
    );
    await user.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancelled", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Delete Secret"
        description="Are you sure?"
        cancelLabel="Cancel"
      />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders danger variant with destructive styling", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Secret"
        description="Are you sure?"
        variant="danger"
      />,
    );
    expect(screen.getByText("Destructive Operation")).toBeInTheDocument();
  });
});
