import { motion } from "framer-motion";
import { Scale, ShieldCheck, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function WhyUs() {
  const { t } = useTranslation();

  const pillars = [
    { icon: Scale, title: t("whyUs.merit"), description: t("whyUs.meritDesc"), iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { icon: ShieldCheck, title: t("whyUs.antiFraud"), description: t("whyUs.antiFraudDesc"), iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { icon: Trophy, title: t("whyUs.rewards"), description: t("whyUs.rewardsDesc"), iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { icon: Users, title: t("whyUs.community"), description: t("whyUs.communityDesc"), iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-dot-grid">
      <div className="container relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">{t("whyUs.badge")}</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {t("whyUs.title")}{" "}<span className="text-gradient">Weekly Music Awards</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{t("whyUs.subtitle")}</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <motion.div key={p.title} variants={itemVariants} className="card-elevated border-gradient-hover group p-6 text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${p.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
