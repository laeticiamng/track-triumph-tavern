import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptContextValue {
  deferredPrompt: BeforeInstallPromptEvent | null;
  canInstall: boolean;
  isIos: boolean;
  showIosGuide: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
  dismissIos: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  deferredPrompt: null,
  canInstall: false,
  isIos: false,
  showIosGuide: false,
  install: async () => {},
  dismiss: () => {},
  dismissIos: () => {},
});

const DISMISS_KEY = "pwa-install-dismissed";
const IOS_DISMISS_KEY = "pwa-ios-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const iosWindow = window as WindowWithMSStream;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !iosWindow.MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIos] = useState(detectIos);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    // iOS guide
    if (isIos) {
      const dismissed = localStorage.getItem(IOS_DISMISS_KEY);
      if (!dismissed || Date.now() - Number(dismissed) >= DISMISS_DURATION_MS) {
        setShowIosGuide(true);
      }
      return;
    }

    // Android / desktop
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIos]);

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

  const dismissIos = useCallback(() => {
    setShowIosGuide(false);
    localStorage.setItem(IOS_DISMISS_KEY, String(Date.now()));
  }, []);

  return (
    <InstallPromptContext.Provider value={{ deferredPrompt, canInstall, isIos, showIosGuide, install, dismiss, dismissIos }}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  return useContext(InstallPromptContext);
}
