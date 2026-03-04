import { Download, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = useInstallPrompt();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {t("pwa.installTitle", "Installer l'application")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("pwa.installDescription", "Ajoutez WMA à votre écran d'accueil pour un accès rapide.")}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                onClick={install}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("pwa.installButton", "Installer")}
              </button>
              <button
                onClick={dismiss}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent transition-colors"
                aria-label={t("pwa.dismiss", "Fermer")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
