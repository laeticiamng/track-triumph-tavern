import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { trackEvent } from "@/lib/analytics";

const StickyContent = forwardRef<HTMLDivElement, {
  visible: boolean;
  clicked: boolean;
  handleClick: () => void;
  t: (key: string) => string;
}>(({ visible, clicked, handleClick, t }, ref) => {
  if (!visible) return null;
  return (
    <motion.div
      ref={ref}
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
          disabled={clicked}
          onClick={handleClick}
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
  );
});
StickyContent.displayName = "StickyContent";

export function StickyMobileCTA() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const impressionTracked = useRef(false);

  const hiddenPaths = ["/auth", "/pricing", "/profile", "/compete", "/submit", "/checkout"];
  const isHiddenPage = hiddenPaths.some((p) => location.pathname.startsWith(p));
  const shouldShow = !isHiddenPage && !user;

  useEffect(() => {
    if (!shouldShow) return;
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldShow]);

  useEffect(() => {
    if (visible && !impressionTracked.current) {
      impressionTracked.current = true;
      trackEvent("page_view" as any, {
        path: location.pathname,
        component: "sticky_cta",
        event_sub: "cta_join_impression",
        language: i18n.language,
      });
    }
  }, [visible, location.pathname, i18n.language]);

  if (!shouldShow || authLoading) return null;

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    trackEvent("page_view" as any, {
      path: location.pathname,
      component: "sticky_cta",
      event_sub: "cta_join_click",
      language: i18n.language,
    });
  };

  return (
    <AnimatePresence>
      <StickyContent
        visible={visible}
        clicked={clicked}
        handleClick={handleClick}
        t={t}
      />
    </AnimatePresence>
  );
}
