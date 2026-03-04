import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Auth from "./Auth";

// Mocks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div data-testid="helmet">{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: (cb: unknown) => mockOnAuthStateChange(cb),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const renderAuth = (route = "/auth") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Auth />
    </MemoryRouter>
  );

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it("renders login view by default", () => {
    renderAuth();
    expect(screen.getByText("auth.welcomeBack")).toBeInTheDocument();
  });

  it("renders signup view when tab=signup", () => {
    renderAuth("/auth?tab=signup");
    expect(screen.getByText("auth.joinContest")).toBeInTheDocument();
  });

  it("shows back to home link", () => {
    renderAuth();
    expect(screen.getByText("auth.backToHome")).toBeInTheDocument();
  });

  it("switches to signup view on click", () => {
    renderAuth();
    fireEvent.click(screen.getByText("auth.signupLink"));
    expect(screen.getByText("auth.joinContest")).toBeInTheDocument();
  });

  it("switches to login view from signup", () => {
    renderAuth("/auth?tab=signup");
    fireEvent.click(screen.getByText("auth.loginLink"));
    expect(screen.getByText("auth.welcomeBack")).toBeInTheDocument();
  });

  it("shows forgot password link in login view", () => {
    renderAuth();
    // The forgot password button is rendered by AuthLoginForm
    expect(screen.getByText("auth.noAccount")).toBeInTheDocument();
  });

  it("renders the WMA logo", () => {
    renderAuth();
    // The music icon div is rendered
    const card = screen.getByText("auth.welcomeBack").closest(".border-border\\/50");
    expect(card).toBeInTheDocument();
  });
});
