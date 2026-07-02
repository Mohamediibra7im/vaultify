import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth-context";

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
  usePathname: vi.fn(() => "/dashboard"),
}));

// Mock api module
const mockApiGet = vi.fn();
vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Helper to inspect AuthProvider state
function TestConsumer() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div data-testid="loading">Loading…</div>;
  if (!user) return <div data-testid="unauthenticated">Redirecting to login…</div>;
  return <div data-testid="authenticated">Logged in as {user.name}</div>;
}

describe("AuthProvider", () => {
  const mockUser = { id: "1", name: "Test User", email: "test@test.com", avatarUrl: null };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading state when token exists and fetch is pending", () => {
    localStorage.setItem("vaultify_token", "pending-token");
    // Never resolving promise keeps isLoading=true
    mockApiGet.mockReturnValue(new Promise<never>(() => {}));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toBeDefined();
    expect(screen.getByText("Loading…")).toBeDefined();
  });

  it("renders children when authenticated", async () => {
    localStorage.setItem("vaultify_token", "valid-token");
    mockApiGet.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // Starts loading, then resolves
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toBeDefined();
      expect(screen.getByText("Logged in as Test User")).toBeDefined();
    });

    expect(mockApiGet).toHaveBeenCalledWith("/auth/me", "valid-token");
  });

  it("redirects when unauthenticated (no token)", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("unauthenticated")).toBeDefined();
      expect(screen.getByText("Redirecting to login…")).toBeDefined();
    });
  });

  it("redirects when token is invalid / fetch fails", async () => {
    localStorage.setItem("vaultify_token", "bad-token");
    mockApiGet.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("unauthenticated")).toBeDefined();
    });

    // Token should be removed from localStorage on failure
    expect(localStorage.getItem("vaultify_token")).toBeNull();
  });

  it("renders redirect consumer when unauthenticated and not loading", async () => {
    // Simulate the dashboard layout pattern: redirect if !user && !isLoading
    function RedirectConsumer() {
      const { user, isLoading } = useAuth();

      if (isLoading) return <div>Loading…</div>;
      if (!user) {
        // The consumer would call router.push("/login") here
        return <div data-testid="redirect">Redirecting to login…</div>;
      }
      return <div>Home</div>;
    }

    render(
      <AuthProvider>
        <RedirectConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("redirect")).toBeDefined();
    });
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    // Suppress console.error from React's error boundary
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider",
    );

    spy.mockRestore();
  });
});
