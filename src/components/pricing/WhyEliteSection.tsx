import { Crown, Mic, TrendingUp, MessageSquareHeart, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const benefitKeys = [
  { icon: <Sparkles className="h-6 w-6" />, titleKey: "pricing.whyEliteFeedback", descKey: "pricing.whyEliteFeedbackDesc" },
  { icon: <MessageSquareHeart className="h-6 w-6" />, titleKey: "pricing.whyEliteComments", descKey: "pricing.whyEliteCommentsDesc" },
  { icon: <BarChart3 className="h-6 w-6" />, titleKey: "pricing.whyEliteStats", descKey: "pricing.whyEliteStatsDesc" },
  { icon: <Crown className="h-6 w-6" />, titleKey: "pricing.whyEliteBadgeTitle", descKey: "pricing.whyEliteBadgeDesc" },
  { icon: <TrendingUp className="h-6 w-6" />, titleKey: "pricing.whyEliteVisibility", descKey: "pricing.whyEliteVisibilityDesc" },
  { icon: <Mic className="h-6 w-6" />, titleKey: "pricing.whyEliteSubmission", descKey: "pricing.whyEliteSubmissionDesc" },
];

export function WhyEliteSection() {
  const { t } = useTranslation();

  return (
    <section className="pb-16">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
            {t("pricing.whyEliteBadge")}
          </span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {t("pricing.whyEliteTitle")}{" "}
            <span className="text-amber-600 dark:text-amber-400">Elite</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("pricing.whyEliteDesc")}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefitKeys.map((b, i) => (
            <motion.div
              key={b.titleKey}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                {b.icon}
              </div>
              <h3 className="font-display text-sm font-semibold">{t(b.titleKey)}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t(b.descKey)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground italic">
            {t("pricing.whyEliteTestimonial")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("pricing.whyEliteTestimonialAuthor")}</p>
        </motion.div>
      </div>
    </section>
  );
}
