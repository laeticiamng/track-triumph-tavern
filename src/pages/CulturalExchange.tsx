import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Globe, Music, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const themes = [
  { monthKey: "culturalExchange.months.jan", traditionKey: "culturalExchange.traditions.flamenco", countryKey: "culturalExchange.countries.spain", color: "bg-red-500/10 text-red-600 dark:text-red-400", descKey: "culturalExchange.desc.flamenco" },
  { monthKey: "culturalExchange.months.feb", traditionKey: "culturalExchange.traditions.balkans", countryKey: "culturalExchange.countries.balkans", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", descKey: "culturalExchange.desc.balkans" },
  { monthKey: "culturalExchange.months.mar", traditionKey: "culturalExchange.traditions.celtic", countryKey: "culturalExchange.countries.celtic", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", descKey: "culturalExchange.desc.celtic" },
  { monthKey: "culturalExchange.months.apr", traditionKey: "culturalExchange.traditions.fado", countryKey: "culturalExchange.countries.portugal", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", descKey: "culturalExchange.desc.fado" },
  { monthKey: "culturalExchange.months.may", traditionKey: "culturalExchange.traditions.chanson", countryKey: "culturalExchange.countries.france", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", descKey: "culturalExchange.desc.chanson" },
  { monthKey: "culturalExchange.months.jun", traditionKey: "culturalExchange.traditions.polka", countryKey: "culturalExchange.countries.central", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", descKey: "culturalExchange.desc.polka" },
  { monthKey: "culturalExchange.months.jul", traditionKey: "culturalExchange.traditions.tarantella", countryKey: "culturalExchange.countries.italy", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", descKey: "culturalExchange.desc.tarantella" },
  { monthKey: "culturalExchange.months.aug", traditionKey: "culturalExchange.traditions.joik", countryKey: "culturalExchange.countries.nordic", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", descKey: "culturalExchange.desc.joik" },
  { monthKey: "culturalExchange.months.sep", traditionKey: "culturalExchange.traditions.rebetiko", countryKey: "culturalExchange.countries.greece", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", descKey: "culturalExchange.desc.rebetiko" },
  { monthKey: "culturalExchange.months.oct", traditionKey: "culturalExchange.traditions.klezmer", countryKey: "culturalExchange.countries.ashkenazi", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", descKey: "culturalExchange.desc.klezmer" },
  { monthKey: "culturalExchange.months.nov", traditionKey: "culturalExchange.traditions.schlager", countryKey: "culturalExchange.countries.germany", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", descKey: "culturalExchange.desc.schlager" },
  { monthKey: "culturalExchange.months.dec", traditionKey: "culturalExchange.traditions.carols", countryKey: "culturalExchange.countries.europe", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", descKey: "culturalExchange.desc.carols" },
];

const criteria = [
  { labelKey: "culturalExchange.criteria.quality", weight: "50%", icon: Music },
  { labelKey: "culturalExchange.criteria.authenticity", weight: "30%", icon: Globe },
  { labelKey: "culturalExchange.criteria.creativity", weight: "20%", icon: Star },
];

const CulturalExchange = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEOHead
        title={t("culturalExchange.seo.title")}
        description={t("culturalExchange.seo.description")}
        url="/cultural-exchange"
      />

      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-amber-500/5" />
        <div className="container relative max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
              <Globe className="h-3.5 w-3.5" />
              {t("culturalExchange.badge")}
            </span>
            <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
              {t("culturalExchange.titlePrefix")} <span className="text-primary">{t("culturalExchange.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("culturalExchange.subtitle")}
            </p>
          </motion.div>

          {/* Criteria */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4 mb-16 max-w-xl mx-auto">
            {criteria.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.labelKey} className="text-center rounded-xl border border-border p-4">
                  <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-semibold">{c.weight}</p>
                  <p className="text-xs text-muted-foreground">{t(c.labelKey)}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Monthly themes */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((th, i) => (
              <motion.div
                key={th.monthKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className={th.color}>{t(th.monthKey)}</Badge>
                      <span className="text-xs text-muted-foreground">{t(th.countryKey)}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t(th.traditionKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(th.descKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link to="/compete">
                <Music className="mr-2 h-4 w-4" />
                {t("culturalExchange.cta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default CulturalExchange;
