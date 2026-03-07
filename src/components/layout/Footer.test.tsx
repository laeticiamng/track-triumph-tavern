import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "./Footer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === "footer.copyright") return `© ${opts?.year} WMA`;
      return key;
    },
    i18n: { language: "fr", changeLanguage: vi.fn() },
  }),
}));

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe("Footer", () => {
  it("renders brand name", () => {
    renderFooter();
    expect(screen.getByText("Weekly Music Awards")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderFooter();
    expect(screen.getByText("footer.explore")).toBeInTheDocument();
    expect(screen.getByText("footer.hallOfFame")).toBeInTheDocument();
    expect(screen.getByText("footer.faq")).toBeInTheDocument();
  });

  it("renders legal links", () => {
    renderFooter();
    expect(screen.getByText("footer.privacy")).toBeInTheDocument();
    expect(screen.getByText("footer.cgu")).toBeInTheDocument();
    expect(screen.getByText("footer.cookies")).toBeInTheDocument();
  });

  it("renders social media links with aria-labels", () => {
    renderFooter();
    const links = screen.getAllByLabelText("footer.followOnPlatform");
    expect(links).toHaveLength(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });
  });

  it("renders copyright with current year", () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} WMA`)).toBeInTheDocument();
  });

  it("renders contact email", () => {
    renderFooter();
    const mail = screen.getByText("contact@emotionscare.com");
    expect(mail.closest("a")).toHaveAttribute("href", "mailto:contact@emotionscare.com");
  });

  it("has accessible nav landmarks", () => {
    renderFooter();
    const navs = screen.getAllByRole("navigation");
    expect(navs.length).toBeGreaterThanOrEqual(2);
    navs.forEach((nav) => {
      expect(nav).toHaveAttribute("aria-label");
    });
  });

  it("renders manage cookies button", () => {
    renderFooter();
    expect(screen.getByText("footer.manageCookies")).toBeInTheDocument();
  });
});
