import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import Compete from "./pages/Compete";
import SubmissionDetail from "./pages/SubmissionDetail";
import Results from "./pages/Results";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import AdminModeration from "./pages/AdminModeration";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ContestRules from "./pages/ContestRules";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/compete" element={<Compete />} />
          <Route path="/submissions/:id" element={<SubmissionDetail />} />
          <Route path="/results" element={<Results />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contest-rules" element={<ContestRules />} />
          <Route path="/cookies" element={<Cookies />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
