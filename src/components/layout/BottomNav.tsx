import { Link, useLocation } from "react-router-dom";
import { Home, Search, Music, Trophy, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const items = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.discover"), href: "/explore", icon: Search },
    { label: t("nav.vote"), href: "/vote", icon: Music },
    { label: t("nav.results"), href: "/results", icon: Trophy },
    { label: user ? t("nav.profile") : t("nav.login"), href: user ? "/profile" : "/auth", icon: User },
  ];

  return (
    <nav aria-label={t("a11y.mainNavigation")} className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass md:hidden pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]">
      <div className="flex h-14 items-center justify-around px-1">
        {items.map((item) => {
          const active = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors min-w-[3rem] min-h-[2.75rem] active:bg-accent/50 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="truncate max-w-[4rem]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
