import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Trophy, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const items = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.explore"), href: "/explore", icon: Search },
    { label: t("nav.vote"), href: "/vote", icon: Heart },
    { label: t("nav.results"), href: "/results", icon: Trophy },
    { label: user ? t("nav.profile") : t("nav.login"), href: user ? "/profile" : "/auth", icon: User },
  ];

  return (
    <nav aria-label={t("a11y.mainNavigation")} className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const active = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
