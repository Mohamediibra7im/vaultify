import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Thrower for testing error states
function Bomb({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("💥 KABOOM");
  }
  return <div data-testid="child">Safe content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Safe content")).toBeDefined();
  });

  it("renders default fallback when child throws", () => {
    // React logs caught errors to console.error — suppress noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("💥 KABOOM")).toBeDefined();
    expect(screen.getByText("Try Again")).toBeDefined();

    spy.mockRestore();
  });

  it("renders custom fallback when provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div data-testid="custom">Custom UI</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("custom")).toBeDefined();

    spy.mockRestore();
  });

  it("resets error state when retry is clicked", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    // Start with error state
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();

    // Rerender with shouldThrow=false to simulate fix
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Click retry to reset boundary state
    await user.click(screen.getByText("Try Again"));

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Safe content")).toBeDefined();

    spy.mockRestore();
  });

  it("calls onReset when retry is clicked", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    await user.click(screen.getByText("Try Again"));

    expect(onReset).toHaveBeenCalledOnce();

    spy.mockRestore();
  });

  it("renders caught error message in default fallback", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    // The actual error message from the thrown error is displayed
    expect(screen.getByText("💥 KABOOM")).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();

    spy.mockRestore();
  });
});
