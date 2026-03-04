import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContestRules from "./ContestRules";

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

const renderPage = () =>
  render(
    <MemoryRouter>
      <ContestRules />
    </MemoryRouter>
  );

describe("ContestRules page – dynamic i18n keys", () => {
  it("renders the page title", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("legal.contestRulesTitle");
  });

  it("renders all 8 dynamically generated articles", () => {
    renderPage();
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`legal.cr${i}Title`)).toBeInTheDocument();
      expect(screen.getByText(`legal.cr${i}Text`)).toBeInTheDocument();
    }
  });

  it("renders last updated and editor", () => {
    renderPage();
    expect(screen.getByText("legal.lastUpdated")).toBeInTheDocument();
    expect(screen.getByText("legal.editor")).toBeInTheDocument();
  });
});
