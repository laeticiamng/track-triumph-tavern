import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CONSENT_KEY = "wma-cookie-consent";

export const CookieConsent = forwardRef<HTMLDivElement>(function CookieConsent(_, ref) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
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
            Ce site utilise des cookies essentiels pour le fonctionnement de la plateforme et l'authentification.{" "}
            <Link to="/cookies" className="text-primary hover:underline">
              En savoir plus
            </Link>
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={accept} className="bg-gradient-primary hover:opacity-90">
              Accepter
            </Button>
            <Button size="sm" variant="outline" onClick={decline}>
              Refuser
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
