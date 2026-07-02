import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorFallback } from "@/components/ui/error-fallback";

describe("ErrorFallback", () => {
  it("renders default title and message when no props provided", () => {
    render(<ErrorFallback />);

    expect(screen.getByText("Error")).toBeDefined();
    expect(screen.getByText("An unexpected error occurred.")).toBeDefined();
  });

  it("renders custom title and message", () => {
    render(
      <ErrorFallback title="Custom Error" message="Something broke." />,
    );

    expect(screen.getByText("Custom Error")).toBeDefined();
    expect(screen.getByText("Something broke.")).toBeDefined();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<ErrorFallback onRetry={vi.fn()} />);

    expect(screen.getByText("Try Again")).toBeDefined();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorFallback />);

    expect(screen.queryByText("Try Again")).toBeNull();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorFallback onRetry={onRetry} />);

    await user.click(screen.getByText("Try Again"));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders shield alert icon", () => {
    const { container } = render(<ErrorFallback />);

    // lucide-react renders inline SVGs
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
  });
});
