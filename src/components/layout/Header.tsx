import { Link, useLocation } from "react-router-dom";
import { Music, Trophy, Search, User, Menu, X, Shield, CreditCard, Heart, Users, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useTranslation();
  const { canInstall, install } = useInstallPrompt();

  const navItems = [
    { label: t("nav.discover"), href: "/explore", icon: Search },
    { label: t("nav.submit"), href: "/compete", icon: Music },
    { label: t("nav.results"), href: "/results", icon: Trophy },
    { label: t("nav.pricing"), href: "/pricing", icon: CreditCard },
  ];

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    Promise.resolve(supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id))
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

        <nav aria-label={t("a11y.mainNavigation")} className="hidden items-center gap-1 md:flex">
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
              <Shield className="h-3.5 w-3.5" /> {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {canInstall && (
            <Button variant="outline" size="sm" onClick={install} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
              <Download className="h-3.5 w-3.5" />
              {t("pwa.installButton", "Installer")}
            </Button>
          )}
          <ThemeToggle compact />
          <LanguageSwitcher compact />
          {user && <NotificationBell />}
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/following" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {t("nav.following", "Abonnements")}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> {t("nav.profile")}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
                <Link to="/auth?tab=signup">{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle compact />
          <LanguageSwitcher compact />
          {user && <NotificationBell />}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
                  <Shield className="h-4 w-4" /> {t("nav.admin")}
                </Link>
              )}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {canInstall && (
                  <Button variant="outline" onClick={() => { install(); setMobileOpen(false); }} className="gap-1.5 border-primary/30 text-primary">
                    <Download className="mr-1 h-4 w-4" />
                    {t("pwa.installButton", "Installer")}
                  </Button>
                )}
                {user ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/following" onClick={() => setMobileOpen(false)}>
                        <Users className="mr-2 h-4 w-4" />
                        {t("nav.following", "Abonnements")}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/profile" onClick={() => setMobileOpen(false)}>{t("nav.profile")}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                    </Button>
                    <Button className="bg-gradient-primary" asChild>
                      <Link to="/auth?tab=signup" onClick={() => setMobileOpen(false)}>{t("nav.signup")}</Link>
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
