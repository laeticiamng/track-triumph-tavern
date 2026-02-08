import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { LoginValues, SignupValues } from "@/lib/auth-schemas";
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      navigate(searchParams.get("redirect") || "/profile");
    }
  }, [user, navigate, searchParams]);

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed")) {
          toast({ title: "Email non confirmé", description: "Vérifiez votre boîte de réception pour confirmer votre email.", variant: "destructive" });
        } else if (msg.includes("invalid login credentials")) {
          toast({ title: "Erreur", description: "Email ou mot de passe incorrect.", variant: "destructive" });
        } else {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (values: SignupValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { display_name: values.displayName || undefined },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Compte existant", description: "Cet email est déjà inscrit. Connectez-vous.", variant: "destructive" });
        } else {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
      } else if (!data.session) {
        setConfirmEmail(values.email);
        setView("confirmation");
      }
    } finally {
      setLoading(false);
    }
  };

  const title: Record<AuthView, string> = {
    login: "Bon retour !",
    signup: "Rejoignez le concours",
    forgot: "Réinitialisation",
    confirmation: "Vérifiez votre email",
  };

  const description: Record<AuthView, string> = {
    login: "Connectez-vous à votre compte",
    signup: "Inscription gratuite — écoutez, votez et découvrez des artistes",
    forgot: "Récupérez l'accès à votre compte",
    confirmation: "",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">{title[view]}</CardTitle>
            {description[view] && <CardDescription>{description[view]}</CardDescription>}
          </CardHeader>

          <CardContent>
            {view === "login" && (
              <>
                <AuthLoginForm onSubmit={handleLogin} loading={loading} onForgotPassword={() => setView("forgot")} />
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Pas encore de compte ?</span>{" "}
                  <button onClick={() => setView("signup")} className="font-medium text-primary hover:underline">S'inscrire</button>
                </div>
              </>
            )}

            {view === "signup" && (
              <>
                <AuthSignupForm onSubmit={handleSignup} loading={loading} />
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Déjà un compte ?</span>{" "}
                  <button onClick={() => setView("login")} className="font-medium text-primary hover:underline">Se connecter</button>
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
