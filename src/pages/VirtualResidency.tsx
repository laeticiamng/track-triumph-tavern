import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Users, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

const countries = ["🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇵🇱", "🇳🇱", "🇸🇪", "🇵🇹", "🇬🇷", "🇮🇪", "🇧🇪", "🇦🇹"];

const VirtualResidency = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const timeline = [
    { weekKey: "virtualResidency.timeline.week1", titleKey: "virtualResidency.timeline.title1", descKey: "virtualResidency.timeline.desc1" },
    { weekKey: "virtualResidency.timeline.week2", titleKey: "virtualResidency.timeline.title2", descKey: "virtualResidency.timeline.desc2" },
    { weekKey: "virtualResidency.timeline.week3", titleKey: "virtualResidency.timeline.title3", descKey: "virtualResidency.timeline.desc3" },
    { weekKey: "virtualResidency.timeline.week4", titleKey: "virtualResidency.timeline.title4", descKey: "virtualResidency.timeline.desc4" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("virtualResidency.seo.title")}
        description={t("virtualResidency.seo.description")}
        url="/virtual-residency"
      />

      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
        <div className="container relative max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-4">
              <MapPin className="h-3.5 w-3.5" />
              {t("virtualResidency.badge")}
            </span>
            <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
              {t("virtualResidency.titlePrefix")} <span className="text-primary">{t("virtualResidency.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("virtualResidency.subtitle")}
            </p>

            <div className="mt-6 flex justify-center gap-2 text-2xl">
              {countries.map((flag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i, type: "spring" }}
                >
                  {flag}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <Alert className="mb-12 max-w-2xl mx-auto border-violet-500/30 bg-violet-500/5">
            <Info className="h-4 w-4 text-violet-600" />
            <AlertDescription className="text-sm text-violet-700 dark:text-violet-400">
              {t("virtualResidency.comingSoon")}
            </AlertDescription>
          </Alert>

          {/* Timeline */}
          <div className="space-y-6 mb-16">
            {timeline.map((tl, i) => (
              <motion.div
                key={tl.weekKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
              >
                <Card>
                  <CardContent className="p-6 flex gap-5 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{t(tl.weekKey)}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{t(tl.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(tl.descKey)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" disabled className="opacity-60 cursor-not-allowed">
              <Users className="mr-2 h-4 w-4" />
              {t("virtualResidency.apply")}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default VirtualResidency;
