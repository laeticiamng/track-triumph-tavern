import { motion } from "framer-motion";
import { Scale, ShieldCheck, Trophy, Banknote, MessageSquare, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function WhyParticipate() {
  const { t } = useTranslation();

  const items = [
    { icon: Banknote, title: t("whyParticipate.prize"), description: t("whyParticipate.prizeDesc"), iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { icon: Scale, title: t("whyParticipate.merit"), description: t("whyParticipate.meritDesc"), iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { icon: ShieldCheck, title: t("whyParticipate.antiFraud"), description: t("whyParticipate.antiFraudDesc"), iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { icon: MessageSquare, title: t("whyParticipate.feedback"), description: t("whyParticipate.feedbackDesc"), iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    { icon: Trophy, title: t("whyParticipate.visibility"), description: t("whyParticipate.visibilityDesc"), iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { icon: BadgeCheck, title: t("whyParticipate.badges"), description: t("whyParticipate.badgesDesc"), iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  ];

  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent" />
      <div className="container relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">{t("whyParticipate.badge")}</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("whyParticipate.title")}</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{t("whyParticipate.subtitle")}</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 sm:mt-16 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          {items.map((item) => (
            <motion.div key={item.title} variants={itemVariants} className="card-elevated border-gradient-hover group p-5 sm:p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
