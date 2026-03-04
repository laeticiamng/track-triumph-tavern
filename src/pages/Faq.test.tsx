import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Faq from "./Faq";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn(), t: (key: string) => key },
  }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <footer />,
}));

const renderFaq = () =>
  render(
    <MemoryRouter>
      <Faq />
    </MemoryRouter>
  );

describe("Faq page – dynamic i18n keys", () => {
  it("renders all 6 FAQ sections", () => {
    renderFaq();
    const sectionTitles = [
      "faqPage.general",
      "faqPage.votesAndScoring",
      "faqPage.submissionsAndCategories",
      "faqPage.rewardsAndPool",
      "faqPage.gamificationAndBadges",
      "faqPage.subscriptionsSection",
    ];
    sectionTitles.forEach((key) => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it("renders all dynamically generated Q&A keys (20 total)", () => {
    renderFaq();
    const expectedKeys = [
      ...Array.from({ length: 5 }, (_, i) => `faqPage.gen_q${i + 1}`),
      ...Array.from({ length: 4 }, (_, i) => `faqPage.vote_q${i + 1}`),
      ...Array.from({ length: 3 }, (_, i) => `faqPage.sub_q${i + 1}`),
      ...Array.from({ length: 3 }, (_, i) => `faqPage.reward_q${i + 1}`),
      ...Array.from({ length: 2 }, (_, i) => `faqPage.badge_q${i + 1}`),
      ...Array.from({ length: 3 }, (_, i) => `faqPage.abo_q${i + 1}`),
    ];
    expectedKeys.forEach((key) => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it("renders the contact section", () => {
    renderFaq();
    expect(screen.getByText("faqPage.noAnswer")).toBeInTheDocument();
    expect(screen.getByText("faqPage.contactUs")).toBeInTheDocument();
  });
});
