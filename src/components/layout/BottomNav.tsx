import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Music, Trophy, User } from "lucide-react";

const items = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Vote", href: "/vote", icon: Heart },
  { label: "Concours", href: "/compete", icon: Music },
  { label: "Résultats", href: "/results", icon: Trophy },
  { label: "Profil", href: "/profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const active = location.pathname === item.href;
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
