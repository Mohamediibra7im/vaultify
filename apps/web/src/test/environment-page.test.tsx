import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import EnvironmentDetailPage from "@/app/dashboard/environments/[id]/page";

const mockUseAuth = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

vi.mock("@/lib/websocket", () => ({
  getSocket: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }),
  useWorkspaceSubscription: vi.fn(),
}));

vi.mock("motion/react", () => {
  const motion = new Proxy(
    {},
    {
      get: (_target: unknown, tag: string) => {
        const Component = React.forwardRef(
          ({ children, ...props }: Record<string, unknown>) =>
            React.createElement(tag as string, props, children),
        );
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    },
  );
  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    children;
  return { motion, AnimatePresence };
});

const mockEnv = {
  id: "env-1",
  name: "Production",
  projectId: "proj-1",
  createdAt: "2025-01-01T00:00:00Z",
  role: "EDITOR",
  project: { id: "proj-1", name: "My Project", workspaceId: "ws-1" },
};

const mockSecrets = [
  { id: "sec-1", key: "DATABASE_URL", version: 1, updatedAt: "2025-01-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
  { id: "sec-2", key: "API_KEY", version: 2, updatedAt: "2025-01-02T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
];

describe("EnvironmentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      token: "mock-token",
      user: { id: "1", name: "Test User", email: "test@test.com" },
    });
  });

  it("renders loading state initially", () => {
    mockApiGet.mockResolvedValue({});
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    expect(screen.getByText("Loading secrets payload...")).toBeInTheDocument();
  });

  it("renders environment name after loading", async () => {
    mockApiGet
      .mockResolvedValueOnce(mockEnv)
      .mockResolvedValueOnce(mockSecrets);
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    await waitFor(() => {
      expect(screen.getByText("Production")).toBeInTheDocument();
    });
  });

  it("renders secrets list", async () => {
    mockApiGet
      .mockResolvedValueOnce(mockEnv)
      .mockResolvedValueOnce(mockSecrets);
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    await waitFor(() => {
      expect(screen.getByText("DATABASE_URL")).toBeInTheDocument();
      expect(screen.getByText("API_KEY")).toBeInTheDocument();
    });
  });

  it('renders "Add New Secret" panel for editors', async () => {
    mockApiGet
      .mockResolvedValueOnce(mockEnv)
      .mockResolvedValueOnce(mockSecrets);
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    await waitFor(() => {
      expect(screen.getByText("Add New Secret")).toBeInTheDocument();
    });
  });

  it("renders view-only message for viewers", async () => {
    const viewerEnv = { ...mockEnv, role: "VIEWER" };
    mockApiGet
      .mockResolvedValueOnce(viewerEnv)
      .mockResolvedValueOnce([]);
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    await waitFor(() => {
      expect(
        screen.getByText("You hold view-only access keys. Modifications are disabled."),
      ).toBeInTheDocument();
    });
  });

  it("renders export button for editors", async () => {
    mockApiGet
      .mockResolvedValueOnce(mockEnv)
      .mockResolvedValueOnce(mockSecrets);
    render(<EnvironmentDetailPage params={Promise.resolve({ id: "env-1" })} />);
    await waitFor(() => {
      expect(screen.getByText("Export")).toBeInTheDocument();
    });
  });
});
