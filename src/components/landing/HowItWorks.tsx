import { motion } from "framer-motion";
import { UserPlus, Headphones, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc"),
      badge: t("howItWorks.free"),
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Headphones, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc"),
      badge: t("howItWorks.free"),
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Trophy, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc"),
      badge: t("howItWorks.pro"),
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="section-divider mb-24" />
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4">{t("howItWorks.badge")}</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("howItWorks.title")}</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">{t("howItWorks.subtitle")}</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div key={i} variants={itemVariants} className="card-elevated border-gradient-hover relative flex flex-col items-center text-center p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border font-display text-sm font-bold shadow-sm">{i + 1}</div>
              {i < steps.length - 1 && <div className="absolute -right-3 top-1/2 hidden md:block w-6 h-px bg-border z-10" />}
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.iconBg} mt-2`}><step.icon className="h-6 w-6" /></div>
              <h3 className="mt-6 font-display text-lg font-semibold">{step.title}</h3>
              <span className={`mt-3 inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${step.badge === t("howItWorks.free") ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"}`}>{step.badge}</span>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
