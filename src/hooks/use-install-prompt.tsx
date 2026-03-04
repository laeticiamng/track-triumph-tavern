import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptContextValue {
  deferredPrompt: BeforeInstallPromptEvent | null;
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  deferredPrompt: null,
  canInstall: false,
  install: async () => {},
  dismiss: () => {},
});

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  return (
    <InstallPromptContext.Provider value={{ deferredPrompt, canInstall, install, dismiss }}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  return useContext(InstallPromptContext);
}
