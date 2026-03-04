import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn(), t: (key: string) => key },
  }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [] }),
      }),
    }),
  },
}));

vi.mock("@/components/gamification/StreakBadge", () => ({
  StreakBadge: () => <div data-testid="streak-badge" />,
}));

vi.mock("@/components/gamification/BadgeShowcase", () => ({
  BadgePills: () => <div data-testid="badge-pills" />,
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  LanguageSwitcher: ({ compact }: { compact?: boolean }) => (
    <div data-testid="lang-switcher" data-compact={compact} />
  ),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe("Header", () => {
  it("renders brand name and logo", () => {
    renderHeader();
    expect(screen.getByText("Weekly Music Awards")).toBeInTheDocument();
  });

  it("renders desktop nav items", () => {
    renderHeader();
    expect(screen.getByText("nav.explore")).toBeInTheDocument();
    expect(screen.getByText("nav.vote")).toBeInTheDocument();
    expect(screen.getByText("nav.submit")).toBeInTheDocument();
    expect(screen.getByText("nav.results")).toBeInTheDocument();
    expect(screen.getByText("nav.pricing")).toBeInTheDocument();
  });

  it("shows login/signup buttons when logged out", () => {
    renderHeader();
    expect(screen.getByText("nav.login")).toBeInTheDocument();
    expect(screen.getByText("nav.signup")).toBeInTheDocument();
  });

  it("renders language switcher", () => {
    renderHeader();
    expect(screen.getAllByTestId("lang-switcher").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible main navigation", () => {
    renderHeader();
    const nav = screen.getByRole("navigation", { name: "a11y.mainNavigation" });
    expect(nav).toBeInTheDocument();
  });

  it("renders mobile menu toggle with aria-label", () => {
    renderHeader();
    const toggle = screen.getByLabelText("header.openMenu");
    expect(toggle).toBeInTheDocument();
  });

  it("opens mobile menu on toggle click", async () => {
    renderHeader();
    const toggle = screen.getByLabelText("header.openMenu");
    fireEvent.click(toggle);
    // After opening, the label changes to close
    expect(await screen.findByLabelText("header.closeMenu")).toBeInTheDocument();
  });

  it("does not show admin link for non-admin users", () => {
    renderHeader();
    expect(screen.queryByText("nav.admin")).not.toBeInTheDocument();
  });
});
