import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Sync on mount with stored preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") setIsDark(false);
    else if (stored === "dark") setIsDark(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={() => {
        document.documentElement.classList.add("theme-transition");
        setIsDark((prev) => !prev);
        setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
      }}
      aria-label={isDark ? t("theme.switchToLight", "Passer en mode clair") : t("theme.switchToDark", "Passer en mode sombre")}
      className="h-9 w-9"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
