import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type ThemeMode = "light" | "dark" | "system";

const CYCLE: ThemeMode[] = ["light", "dark", "system"];

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(mode: ThemeMode) {
  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycle = useCallback(() => {
    document.documentElement.classList.add("theme-transition");
    setTheme((prev) => CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length]);
    setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
  }, []);

  const icon = theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const label = t(`theme.${theme}`, theme);

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={cycle}
      aria-label={label}
      className="h-9 w-9"
    >
      {icon}
    </Button>
  );
}
