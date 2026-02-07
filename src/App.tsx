import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import Compete from "./pages/Compete";
import SubmissionDetail from "./pages/SubmissionDetail";
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
import NotFound from "./pages/NotFound";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/vote" element={<Vote />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
