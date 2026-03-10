import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { LoginValues, SignupValues } from "@/lib/auth-schemas";
import { trackEvent } from "@/lib/analytics";
import AuthLoginForm from "@/components/auth/AuthLoginForm";
import AuthSignupForm from "@/components/auth/AuthSignupForm";
import AuthForgotPassword from "@/components/auth/AuthForgotPassword";
import AuthConfirmationScreen from "@/components/auth/AuthConfirmationScreen";

type AuthView = "login" | "signup" | "forgot" | "confirmation";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<AuthView>(searchParams.get("tab") === "signup" ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); }).catch(() => {});
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) navigate(searchParams.get("redirect") || "/profile"); }, [user, navigate, searchParams]);

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed")) {
          toast({ title: t("auth.emailNotConfirmed"), description: t("auth.emailNotConfirmedDesc"), variant: "destructive" });
        } else if (msg.includes("invalid login credentials")) {
          toast({ title: t("errors.error"), description: t("auth.invalidCredentials"), variant: "destructive" });
        } else {
          toast({ title: t("errors.error"), description: error.message, variant: "destructive" });
        }
      }
    } finally { setLoading(false); }
  };

  const handleSignup = async (values: SignupValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email, password: values.password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: values.displayName || undefined } },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: t("auth.accountExists"), description: t("auth.accountExistsDesc"), variant: "destructive" });
        } else {
          toast({ title: t("errors.error"), description: error.message, variant: "destructive" });
        }
      } else if (!data.session) {
        trackEvent("signup_completed", { method: "email" });
        setConfirmEmail(values.email);
        setView("confirmation");
      }
    } finally { setLoading(false); }
  };

  const titles: Record<AuthView, string> = {
    login: t("auth.welcomeBack"), signup: t("auth.joinContest"), forgot: t("auth.resetTitle"), confirmation: t("auth.confirmTitle"),
  };
  const descriptions: Record<AuthView, string> = {
    login: t("auth.loginDesc"), signup: t("auth.signupDesc"), forgot: t("auth.resetDesc"), confirmation: "",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:py-4">
      <SEOHead title={t("auth.seoTitle")} description={t("auth.seoDesc")} url="/auth" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          <ArrowLeft className="h-4 w-4" /> {t("auth.backToHome")}
        </Link>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">{titles[view]}</CardTitle>
            {descriptions[view] && <CardDescription>{descriptions[view]}</CardDescription>}
          </CardHeader>

          <CardContent>
            {view === "login" && (
              <>
                <AuthLoginForm onSubmit={handleLogin} loading={loading} onForgotPassword={() => setView("forgot")} />
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">{t("auth.noAccount")}</span>{" "}
                  <button onClick={() => setView("signup")} className="font-medium text-primary hover:underline">{t("auth.signupLink")}</button>
                </div>
              </>
            )}
            {view === "signup" && (
              <>
                <AuthSignupForm onSubmit={handleSignup} loading={loading} />
                <p className="mt-3 text-center text-xs text-muted-foreground">{t("auth.signupFree")}</p>
                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">{t("auth.hasAccount")}</span>{" "}
                  <button onClick={() => setView("login")} className="font-medium text-primary hover:underline">{t("auth.loginLink")}</button>
                </div>
              </>
            )}
            {view === "forgot" && <AuthForgotPassword onBack={() => setView("login")} />}
            {view === "confirmation" && <AuthConfirmationScreen email={confirmEmail} onBack={() => setView("login")} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
