import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Vote from "./Vote";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn() },
  }),
}));

// Affiche l'URL courante pour vérifier la cible exacte de la redirection
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="explore-page">{location.pathname + location.search}</div>;
}

describe("Vote page", () => {
  it("redirects to /explore?mode=vote", () => {
    render(
      <MemoryRouter initialEntries={["/vote"]}>
        <Routes>
          <Route path="/vote" element={<Vote />} />
          <Route path="/explore" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    // Auparavant ce test n'affirmait rien ; on vérifie désormais la redirection
    // et le paramètre de requête mode=vote.
    expect(screen.getByTestId("explore-page")).toHaveTextContent("/explore?mode=vote");
  });
});
