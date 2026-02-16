import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const CONSENT_KEY = "wma-cookie-consent";

interface CookiePreferences {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
}

function getStoredPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const prefs = getStoredPreferences();
    if (!prefs) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, consentedAt: new Date().toISOString() }));
    setShow(false);
  };

  const reopenBanner = () => {
    const prefs = getStoredPreferences();
    if (prefs) {
      setAnalytics(prefs.analytics);
      setMarketing(prefs.marketing);
    }
    setShow(true);
  };

  // Expose reopenBanner globally so Footer can call it
  useEffect(() => {
    (window as Window & { __reopenCookieBanner?: () => void }).__reopenCookieBanner = reopenBanner;
    return () => { delete (window as Window & { __reopenCookieBanner?: () => void }).__reopenCookieBanner; };
  });

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const acceptSelected = () => {
    savePreferences({ essential: true, analytics, marketing });
  };

  const declineAll = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-border bg-card p-5 shadow-lg md:bottom-6"
        >
          <p className="text-sm leading-relaxed text-foreground">
            Ce site utilise des cookies pour le fonctionnement de la plateforme.
            Vous pouvez personnaliser vos préférences.{" "}
            <Link to="/cookies" className="text-primary hover:underline">
              En savoir plus
            </Link>
          </p>

          {/* Granular cookie preferences */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Personnaliser
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                  <label className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Essentiels</strong> — Authentification, sécurité
                    </span>
                    <input type="checkbox" checked disabled className="accent-primary" />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Analytiques</strong> — Statistiques d'utilisation
                    </span>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Marketing</strong> — Publicités personnalisées
                    </span>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="accent-primary"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={acceptAll}>
              Tout accepter
            </Button>
            {showDetails && (
              <Button size="sm" variant="secondary" onClick={acceptSelected}>
                Enregistrer mes choix
              </Button>
            )}
            <Button size="sm" onClick={declineAll}>
              Tout refuser
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
