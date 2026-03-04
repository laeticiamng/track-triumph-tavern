import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

// Mock i18next
const changeLanguageMock = vi.fn();
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "fr",
      changeLanguage: changeLanguageMock,
      t: (key: string) => key,
    },
    t: (key: string) => key,
  }),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    changeLanguageMock.mockClear();
  });

  it("renders the trigger button with globe icon", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("shows flag + code in default mode", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/🇫🇷/)).toBeInTheDocument();
    expect(screen.getByText(/FR/)).toBeInTheDocument();
  });

  it("shows only flag in compact mode", () => {
    render(<LanguageSwitcher compact />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("🇫🇷");
    expect(btn.textContent).not.toContain("FR");
  });

  it("has an aria-label for accessibility", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "a11y.changeLanguage");
  });

  it("trigger has aria-haspopup attribute", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-haspopup", "menu");
  });

  it("trigger has correct initial aria-expanded state", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });
});
