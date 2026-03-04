import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AudioPlayer } from "./AudioPlayer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn() },
  }),
}));

// Mock HTMLMediaElement methods
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

describe("AudioPlayer", () => {
  it("renders compact player with play button", () => {
    render(<AudioPlayer src="/test.mp3" compact />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "a11y.playExcerpt");
  });

  it("renders full player with title and artist", () => {
    render(<AudioPlayer src="/test.mp3" title="Ma chanson" artist="Artiste" />);
    expect(screen.getByText("Ma chanson")).toBeInTheDocument();
    expect(screen.getByText("Artiste")).toBeInTheDocument();
  });

  it("renders cover image when provided", () => {
    render(<AudioPlayer src="/test.mp3" coverUrl="/cover.jpg" title="Test" />);
    const img = screen.getByAltText("Test");
    expect(img).toHaveAttribute("src", "/cover.jpg");
  });

  it("toggles play/pause on button click", () => {
    render(<AudioPlayer src="/test.mp3" compact />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "a11y.playExcerpt");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-label", "a11y.pause");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-label", "a11y.playExcerpt");
  });

  it("has a slider for audio progress", () => {
    render(<AudioPlayer src="/test.mp3" compact />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("displays time in M:SS format", () => {
    render(<AudioPlayer src="/test.mp3" compact />);
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("shows duration in full mode", () => {
    render(<AudioPlayer src="/test.mp3" title="T" />);
    expect(screen.getByText(/0:00 \/ 0:00/)).toBeInTheDocument();
  });

  it("prevents context menu on audio element", () => {
    render(<AudioPlayer src="/test.mp3" compact />);
    const audio = document.querySelector("audio")!;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    const prevented = !audio.dispatchEvent(event);
    expect(prevented).toBe(true);
  });
});
