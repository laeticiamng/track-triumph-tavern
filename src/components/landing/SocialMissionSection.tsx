import { motion } from "framer-motion";
import { Heart, Globe, Award, Accessibility, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function SocialMissionSection() {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: Accessibility,
      titleKey: "socialMission.pillars.inclusionTitle",
      descKey: "socialMission.pillars.inclusionDesc",
      gradient: "from-rose-500/20 to-pink-500/20",
      iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
    {
      icon: Globe,
      titleKey: "socialMission.pillars.exchangeTitle",
      descKey: "socialMission.pillars.exchangeDesc",
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Award,
      titleKey: "socialMission.pillars.impactTitle",
      descKey: "socialMission.pillars.impactDesc",
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-4">
            <Heart className="h-3.5 w-3.5" />
            {t("socialMission.badge")}
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {t("socialMission.titlePrefix")}<span className="text-primary">{t("socialMission.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t("socialMission.subtitle")}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`rounded-2xl border border-border bg-gradient-to-br ${p.gradient} p-7 transition-all hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.iconBg} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(p.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button asChild size="lg">
            <Link to="/cultural-exchange">
              <Globe className="mr-2 h-4 w-4" />
              {t("socialMission.ctaExchange")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/impact">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("socialMission.ctaImpact")}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
