import { motion } from "framer-motion";
import { Accessibility, Globe, Video, MapPin, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const programs = [
  { icon: Accessibility, titleKey: "programsOverview.inclusionTitle", descKey: "programsOverview.inclusionDesc", link: "/categories/inclusion", accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { icon: Globe, titleKey: "programsOverview.exchangeTitle", descKey: "programsOverview.exchangeDesc", link: "/cultural-exchange", accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { icon: Video, titleKey: "programsOverview.mentorTitle", descKey: "programsOverview.mentorDesc", link: "/mentor-match", accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: MapPin, titleKey: "programsOverview.residencyTitle", descKey: "programsOverview.residencyDesc", link: "/virtual-residency", accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { icon: BarChart3, titleKey: "programsOverview.impactTitle", descKey: "programsOverview.impactDesc", link: "/impact", accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

export function ProgramsOverview() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("programsOverview.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("programsOverview.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5 px-4 sm:px-0">
          {programs.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={p.link}
                  className="group flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 rounded-xl border border-border bg-card p-4 sm:p-5 text-left sm:text-center transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${p.accent} sm:mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 sm:flex sm:flex-col sm:items-center min-w-0">
                    <h3 className="text-sm font-semibold leading-tight">{t(p.titleKey)}</h3>
                    <p className="mt-1 sm:mt-1.5 text-xs text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:mt-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
