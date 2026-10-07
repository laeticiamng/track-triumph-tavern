import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// État d'authentification piloté par chaque test
let authState: { user: { id: string } | null; loading: boolean } = { user: null, loading: false };
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

// Rôles renvoyés par la table user_roles (simulée)
let rolesResponse: { data: { role: string }[] | null; error: unknown } = { data: [], error: null };
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve(rolesResponse),
      }),
    }),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function renderAt(path: string, requiredRole?: "admin" | "moderator" | "user") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>contenu-protege</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>page-connexion</div>} />
        <Route path="/" element={<div>page-accueil</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState = { user: null, loading: false };
    rolesResponse = { data: [], error: null };
  });

  it("redirige un visiteur non connecté vers /auth (route sans rôle)", async () => {
    renderAt("/admin");
    expect(await screen.findByText("page-connexion")).toBeInTheDocument();
  });

  it("redirige un visiteur non connecté vers /auth même si un rôle est exigé (pas de chargement infini)", async () => {
    renderAt("/admin", "admin");
    expect(await screen.findByText("page-connexion")).toBeInTheDocument();
    expect(screen.queryByText("contenu-protege")).not.toBeInTheDocument();
  });

  it("affiche le contenu à un utilisateur qui possède le rôle exigé", async () => {
    authState = { user: { id: "u1" }, loading: false };
    rolesResponse = { data: [{ role: "admin" }], error: null };
    renderAt("/admin", "admin");
    expect(await screen.findByText("contenu-protege")).toBeInTheDocument();
  });

  it("renvoie à l'accueil un utilisateur connecté sans le rôle exigé", async () => {
    authState = { user: { id: "u2" }, loading: false };
    rolesResponse = { data: [{ role: "user" }], error: null };
    renderAt("/admin", "admin");
    expect(await screen.findByText("page-accueil")).toBeInTheDocument();
    expect(screen.queryByText("contenu-protege")).not.toBeInTheDocument();
  });

  it("refuse l'accès si la lecture des rôles échoue", async () => {
    authState = { user: { id: "u3" }, loading: false };
    rolesResponse = { data: null, error: { message: "erreur réseau" } };
    renderAt("/admin", "admin");
    expect(await screen.findByText("page-accueil")).toBeInTheDocument();
    expect(screen.queryByText("contenu-protege")).not.toBeInTheDocument();
  });
});
