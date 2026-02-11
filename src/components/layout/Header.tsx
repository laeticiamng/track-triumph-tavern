import { Link, useLocation } from "react-router-dom";
import { Music, Trophy, Search, User, Menu, X, Shield, CreditCard, Info, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Explorer", href: "/explore", icon: Search },
  { label: "Soumettre", href: "/compete", icon: Music },
  { label: "Résultats", href: "/results", icon: Trophy },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Tarifs", href: "/pricing", icon: CreditCard },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const roles = data?.map((r) => r.role) || [];
        setIsAdmin(roles.includes("admin") || roles.includes("moderator"));
      })
      .catch(() => {});
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Weekly Music Awards
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/moderation"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-1 ${
                location.pathname.startsWith("/admin") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profil
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
                <Link to="/auth?tab=signup">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border md:hidden glass"
          >
            <nav className="container flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent ${
                    location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin/moderation"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <Button variant="outline" asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>Mon Profil</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>Connexion</Link>
                    </Button>
                    <Button className="bg-gradient-primary" asChild>
                      <Link to="/auth?tab=signup" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
