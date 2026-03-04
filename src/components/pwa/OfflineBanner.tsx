import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="fixed top-16 inset-x-0 z-40 overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 bg-destructive/90 backdrop-blur px-4 py-2 text-destructive-foreground text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>{t("offline.banner", "Vous êtes hors ligne")}</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 inline-flex items-center gap-1 rounded-md bg-destructive-foreground/20 px-2 py-0.5 text-xs font-semibold hover:bg-destructive-foreground/30 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              {t("offline.retry", "Réessayer")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
