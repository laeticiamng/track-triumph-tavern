import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SubmissionReview from "./SubmissionReview";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: unknown) => {
      if (opts && typeof opts === "object" && opts !== null) {
        if ("count" in (opts as Record<string, unknown>)) return `${key}:${(opts as Record<string, unknown>).count}`;
        if ("number" in (opts as Record<string, unknown>)) return `${key}:${(opts as Record<string, unknown>).number}`;
      }
      return key;
    },
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

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "test-user-id" }, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: vi.fn(),
  },
}));

describe("SubmissionReview page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders page title and subtitle", async () => {
    render(
      <MemoryRouter>
        <SubmissionReview />
      </MemoryRouter>
    );
    expect(await screen.findByText("submissionReview.title")).toBeInTheDocument();
    expect(screen.getByText("submissionReview.subtitle")).toBeInTheDocument();
  });

  it("renders empty state with dynamic i18n keys", async () => {
    render(
      <MemoryRouter>
        <SubmissionReview />
      </MemoryRouter>
    );
    expect(await screen.findByText("submissionReview.noSubmissions")).toBeInTheDocument();
    expect(screen.getByText("submissionReview.noSubmissionsDesc")).toBeInTheDocument();
    expect(screen.getByText("submissionReview.submitTrack")).toBeInTheDocument();
  });

  it("has a link back to compete page", async () => {
    render(
      <MemoryRouter>
        <SubmissionReview />
      </MemoryRouter>
    );
    expect(await screen.findByText("submissionReview.newSubmission")).toBeInTheDocument();
  });
});
