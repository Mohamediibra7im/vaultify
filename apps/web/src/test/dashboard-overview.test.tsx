import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

// Mock next/link — renders plain <a> for testing
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock motion to avoid animation side effects in jsdom
vi.mock("motion/react", () => {
  const motion = new Proxy(
    {},
    {
      get: (_target: unknown, tag: string) => {
        const Component = React.forwardRef(
          ({ children, ...props }: Record<string, unknown>) => {
            const Element = tag;
            return React.createElement(Element, props, children);
          },
        );
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    },
  );
  return { motion };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test User", email: "test@test.com", avatarUrl: null },
      isLoading: false,
      token: "test-token",
    });

    mockApiGet.mockImplementation(async (path: string) => {
      if (path === "/workspaces") {
        return [
          {
            id: "workspace-1",
            name: "Core Vault",
            createdAt: "2026-07-03T00:00:00.000Z",
            _count: { members: 4, projects: 2 },
          },
        ];
      }

      if (path === "/workspaces/workspace-1/audit-logs?limit=10") {
        return [
          {
            id: "activity-1",
            action: "secret.create",
            target: "DATABASE_URL",
            actorName: "Test User",
            createdAt: "2026-07-03T01:00:00.000Z",
          },
        ];
      }

      return [];
    });
  });

  it("renders welcome message with user name", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Good morning, Test\./)).toBeDefined();
  });

  it("renders premium dashboard labels", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Vault console")).toBeDefined();
    expect(screen.getByText("Premium controls, no sidebar")).toBeDefined();
  });

  it("renders all four stat cards", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Named security boundaries")).toBeDefined();
    expect(screen.getByText("Services and environments")).toBeDefined();
    expect(screen.getByText("Granted access across teams")).toBeDefined();
    expect(screen.getByText("Recent changes in the vault")).toBeDefined();
  });

  it("renders core navigation links", async () => {
    render(<DashboardPage />);

    expect(await screen.findByRole("link", { name: /^Search secrets/ })).toBeDefined();
    expect(screen.getAllByRole("link", { name: "New workspace" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Review audit trail" })).toBeDefined();
  });

  it("renders links with correct hrefs", () => {
    render(<DashboardPage />);

    const workspaceLink = screen.getAllByRole("link", { name: "New workspace" })[0];
    expect(workspaceLink?.getAttribute("href")).toBe("/dashboard/workspaces/new");

    const auditLink = screen.getByRole("link", { name: "Review audit trail" });
    expect(auditLink?.getAttribute("href")).toBe("/dashboard/audit");
  });

  it("returns null when user is falsy", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { container } = render(<DashboardPage />);
    expect(container.innerHTML).toBe("");
  });

  it("renders client session description text", () => {
    render(<DashboardPage />);
    expect(
      screen.getByText(
        /Keep encrypted workspaces, projects, and audit trails moving from one place/,
      ),
    ).toBeDefined();
  });
});
