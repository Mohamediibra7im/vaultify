import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NotificationBell } from "@/components/notification-bell";

const mockUseAuth = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

const mockApiGet = vi.fn();
vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: "mock-token", user: { name: "Test" } });
  });

  it("renders bell icon as a link to /dashboard/notifications", () => {
    mockApiGet.mockResolvedValue({ count: 0 });
    render(<NotificationBell />);
    const link = screen.getByTitle("Notifications");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard/notifications");
  });

  it("renders unread count badge when count > 0", async () => {
    mockApiGet.mockResolvedValue({ count: 3 });
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("does not render badge when count is 0", async () => {
    mockApiGet.mockResolvedValue({ count: 0 });
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  it("does not open any dropdown", async () => {
    mockApiGet.mockResolvedValue({ count: 0 });
    render(<NotificationBell />);
    const link = screen.getByTitle("Notifications");
    expect(link.tagName).toBe("A");
    // No dropdown content should be present
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
