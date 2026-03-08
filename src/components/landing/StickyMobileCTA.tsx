import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function StickyMobileCTA() {
  const { t } = useTranslation();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  // Only show on homepage
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      // Show after scrolling past the hero (~85vh)
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  if (!isHome) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-0 right-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-4 rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-xl p-3">
            <Button
              size="lg"
              className="w-full font-semibold text-base shadow-md"
              asChild
            >
              <Link to="/auth?tab=signup">
                {t("stickyCta.joinNow")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
              {t("stickyCta.freeVoting")} · {t("stickyCta.noCard")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
