import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CookieConsent } from "@/components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import Compete from "./pages/Compete";
import SubmissionDetail from "./pages/SubmissionDetail";
import SubmissionReview from "./pages/SubmissionReview";
import Results from "./pages/Results";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ArtistProfile from "./pages/ArtistProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ContestRules from "./pages/ContestRules";
import Cookies from "./pages/Cookies";
import ScoringMethod from "./pages/ScoringMethod";
import HallOfFame from "./pages/HallOfFame";
import Vote from "./pages/Vote";
import Stats from "./pages/Stats";
import ArtistStats from "./pages/ArtistStats";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import CategoryDetail from "./pages/CategoryDetail";
import Sitemap from "./components/seo/Sitemap";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
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
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contest-rules" element={<ContestRules />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/scoring-method" element={<ScoringMethod />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/about" element={<About />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
