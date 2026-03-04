import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

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

const mockUser = { id: "user-123", email: "test@test.com" };
const mockSignOut = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: mockUser, session: {}, loading: false, signOut: mockSignOut }),
}));

vi.mock("@/hooks/use-subscription", () => ({
  useSubscription: () => ({ tier: "free", subscribed: false, subscriptionEnd: null, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: (...args: unknown[]) => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: table === "profiles"
              ? { id: "user-123", display_name: "TestUser", avatar_url: null, bio: null, social_links: {}, banner_url: null, created_at: "", updated_at: "" }
              : null,
          }),
          order: () => Promise.resolve({ data: [] }),
        }),
      }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: () => Promise.resolve({ data: { session: {} } }),
    },
    storage: { from: () => ({ upload: vi.fn(), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock("@/components/gamification/StreakBadge", () => ({
  StreakBadge: () => <div data-testid="streak-badge" />,
}));

vi.mock("@/components/gamification/BadgeShowcase", () => ({
  BadgeShowcase: () => <div data-testid="badge-showcase" />,
}));

vi.mock("@/components/profile/VoteStatsChart", () => ({
  VoteStatsChart: () => <div data-testid="vote-stats" />,
}));

vi.mock("@/components/ai/AIVoteSummary", () => ({
  AIVoteSummary: () => <div data-testid="ai-summary" />,
}));

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

describe("Profile page", () => {
  it("renders profile title", async () => {
    renderProfile();
    expect(await screen.findByText("profilePage.title")).toBeInTheDocument();
  });

  it("renders logout button", async () => {
    renderProfile();
    expect(await screen.findByText("profilePage.logout")).toBeInTheDocument();
  });

  it("renders stats cards", async () => {
    renderProfile();
    expect(await screen.findByText("profilePage.submissions")).toBeInTheDocument();
    expect(screen.getByText("profilePage.votesGiven")).toBeInTheDocument();
    expect(screen.getByText("profilePage.votesReceived")).toBeInTheDocument();
  });

  it("shows free plan for non-subscribed user", async () => {
    renderProfile();
    expect(await screen.findByText("profilePage.freeLabel")).toBeInTheDocument();
  });

  it("shows view plans button for free users", async () => {
    renderProfile();
    const links = await screen.findAllByText("profilePage.viewPlans");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("renders edit button", async () => {
    renderProfile();
    expect(await screen.findByText("common.edit")).toBeInTheDocument();
  });

  it("renders streak badge component", async () => {
    renderProfile();
    expect(await screen.findByTestId("streak-badge")).toBeInTheDocument();
  });

  it("renders badge showcase component", async () => {
    renderProfile();
    expect(await screen.findByTestId("badge-showcase")).toBeInTheDocument();
  });
});
