import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Eagerly load the landing page for fast first paint
import Index from "./pages/Index";

// Lazy-load all other pages for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const Explore = lazy(() => import("./pages/Explore"));
const Compete = lazy(() => import("./pages/Compete"));
const SubmissionDetail = lazy(() => import("./pages/SubmissionDetail"));
const SubmissionReview = lazy(() => import("./pages/SubmissionReview"));
const Results = lazy(() => import("./pages/Results"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ContestRules = lazy(() => import("./pages/ContestRules"));
const Cookies = lazy(() => import("./pages/Cookies"));
const ScoringMethod = lazy(() => import("./pages/ScoringMethod"));
const HallOfFame = lazy(() => import("./pages/HallOfFame"));
const Vote = lazy(() => import("./pages/Vote"));
const Stats = lazy(() => import("./pages/Stats"));
const ArtistStats = lazy(() => import("./pages/ArtistStats"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const CGV = lazy(() => import("./pages/CGV"));
const Faq = lazy(() => import("./pages/Faq"));
const Sitemap = lazy(() => import("./components/seo/Sitemap"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/compete" element={<Compete />} />
            <Route path="/submit" element={<Compete />} />
            <Route path="/submit/review" element={<SubmissionReview />} />
            <Route path="/submissions/:id" element={<SubmissionDetail />} />
            <Route path="/results" element={<Results />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/moderation" element={<AdminDashboard />} />
            <Route path="/admin/fraud" element={<AdminDashboard />} />
            <Route path="/admin/weeks" element={<AdminDashboard />} />
            <Route path="/admin/rewards" element={<AdminDashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contest-rules" element={<ContestRules />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/scoring-method" element={<ScoringMethod />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal/mentions" element={<MentionsLegales />} />
            <Route path="/legal/cgv" element={<CGV />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/stats/artist/:id" element={<ArtistStats />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />

            {/* French route redirects — fix broken /fr/* routes */}
            <Route path="/fr" element={<Navigate to="/" replace />} />
            <Route path="/fr/accueil" element={<Navigate to="/" replace />} />
            <Route path="/fr/explorer" element={<Navigate to="/explore" replace />} />
            <Route path="/fr/concourir" element={<Navigate to="/compete" replace />} />
            <Route path="/fr/soumettre" element={<Navigate to="/compete" replace />} />
            <Route path="/fr/resultats" element={<Navigate to="/results" replace />} />
            <Route path="/fr/résultats" element={<Navigate to="/results" replace />} />
            <Route path="/fr/tarifs" element={<Navigate to="/pricing" replace />} />
            <Route path="/fr/profil" element={<Navigate to="/profile" replace />} />
            <Route path="/fr/a-propos" element={<Navigate to="/about" replace />} />
            <Route path="/fr/à-propos" element={<Navigate to="/about" replace />} />
            <Route path="/fr/voter" element={<Navigate to="/vote" replace />} />
            <Route path="/fr/classement" element={<Navigate to="/results" replace />} />
            <Route path="/fr/hall-of-fame" element={<Navigate to="/hall-of-fame" replace />} />
            <Route path="/fr/reglement" element={<Navigate to="/contest-rules" replace />} />
            <Route path="/fr/règlement" element={<Navigate to="/contest-rules" replace />} />
            <Route path="/fr/statistiques" element={<Navigate to="/stats" replace />} />
            <Route path="/fr/categories/:slug" element={<Navigate to="/explore" replace />} />
            <Route path="/fr/*" element={<Navigate to="/" replace />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
