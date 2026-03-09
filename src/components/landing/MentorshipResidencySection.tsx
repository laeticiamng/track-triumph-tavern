import { motion } from "framer-motion";
import { Video, Users, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function MentorshipResidencySection() {
  const { t } = useTranslation();

  const programs = [
    {
      icon: Video,
      badgeKey: "mentorship.programs.mentorBadge",
      title: "Mentor Match",
      descKey: "mentorship.programs.mentorDesc",
      ctaKey: "mentorship.programs.mentorCta",
      link: "/mentor-match",
      gradient: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-500/10",
    },
    {
      icon: MapPin,
      badgeKey: "mentorship.programs.residencyBadge",
      title: "Virtual Residency",
      descKey: "mentorship.programs.residencyDesc",
      ctaKey: "mentorship.programs.residencyCta",
      link: "/virtual-residency",
      gradient: "from-violet-500/10 to-purple-500/10",
      accent: "text-violet-600 dark:text-violet-400",
      accentBg: "bg-violet-500/10",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            <Users className="h-3.5 w-3.5" />
            {t("mentorship.badge")}
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {t("mentorship.titlePrefix")} <span className="text-primary">{t("mentorship.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t("mentorship.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {programs.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`rounded-2xl border border-border bg-gradient-to-br ${p.gradient} p-8 flex flex-col`}
              >
                <span className={`inline-flex items-center gap-2 rounded-full ${p.accentBg} px-3 py-1 text-xs font-semibold ${p.accent} mb-5 w-fit`}>
                  <Icon className="h-3.5 w-3.5" />
                  {t(p.badgeKey)}
                </span>
                <h3 className="font-display text-2xl font-bold mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{t(p.descKey)}</p>
                <Button asChild variant="outline" className="mt-6 w-fit group">
                  <Link to={p.link}>
                    {t(p.ctaKey)}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
