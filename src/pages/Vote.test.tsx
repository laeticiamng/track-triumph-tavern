import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Vote from "./Vote";

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

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/hooks/use-vote-state", () => ({
  useVoteState: () => ({
    voteCount: 0,
    remainingVotes: 3,
    canVote: true,
    tier: "free",
    votedCategories: new Set(),
    commentsUsed: 0,
    commentsMax: 0,
    recordVote: vi.fn(),
  }),
}));

// Mock supabase with empty data
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
          maybeSingle: () => Promise.resolve({ data: null }),
          order: () => ({
            then: (cb: Function) => cb({ data: [] }),
          }),
        }),
        order: () => ({
          then: (cb: Function) => cb({ data: [] }),
        }),
      }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
    },
  },
}));

vi.mock("@/components/layout/Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("@/components/layout/BottomNav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav">BottomNav</nav>,
}));

vi.mock("@/components/vote/VoteQuotaBar", () => ({
  VoteQuotaBar: () => <div data-testid="vote-quota">Quota</div>,
}));

vi.mock("@/components/gamification/StreakBadge", () => ({
  StreakBadge: () => <div data-testid="streak-badge" />,
}));

vi.mock("@/components/gamification/BadgeProgress", () => ({
  BadgeProgress: () => <div data-testid="badge-progress" />,
}));

vi.mock("@/components/vote/CategoryProgressBar", () => ({
  CategoryProgressBar: () => <div data-testid="cat-progress" />,
}));

vi.mock("@/components/ai/AIRecommendations", () => ({
  AIRecommendations: () => null,
}));

vi.mock("@/components/vote/VoteFeed", () => ({
  VoteFeed: () => <div data-testid="vote-feed">Feed</div>,
}));

const renderVote = () =>
  render(
    <MemoryRouter>
      <Vote />
    </MemoryRouter>
  );

describe("Vote page", () => {
  it("renders header and bottom nav", () => {
    renderVote();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });

  it("renders vote quota bar", () => {
    renderVote();
    expect(screen.getByTestId("vote-quota")).toBeInTheDocument();
  });

  it("shows 'All' filter button", () => {
    renderVote();
    expect(screen.getByText("votePage.all")).toBeInTheDocument();
  });

  it("shows login prompt when not authenticated and no submissions", async () => {
    renderVote();
    expect(await screen.findByText("votePage.loginToVote")).toBeInTheDocument();
  });

  it("shows join contest CTA in empty state", async () => {
    renderVote();
    expect(await screen.findByText("votePage.joinContest")).toBeInTheDocument();
  });

  it("shows browse tracks link in empty state for non-auth users", async () => {
    renderVote();
    expect(await screen.findByText("votePage.browseFirst")).toBeInTheDocument();
  });
});
