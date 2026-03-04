import { useTranslation } from "react-i18next";
import { useBadgeProgress } from "@/hooks/use-weekly-badges";
import { BADGE_CONFIG } from "@/hooks/use-weekly-badges";
import { motion } from "framer-motion";

interface BadgeProgressProps { weekId?: string | null; }

export function BadgeProgress({ weekId }: BadgeProgressProps) {
  const { voteCount, commentCount, categoryCount } = useBadgeProgress(weekId);
  const { t } = useTranslation();

  if (voteCount === 0) return null;

  const progressItems = [
    { type: "top_voter" as const, value: voteCount, label: voteCount > 1 ? t("badges.votesPlural", { count: voteCount }) : t("badges.votes", { count: voteCount }) },
    { type: "critic" as const, value: commentCount, label: commentCount > 1 ? t("badges.commentsPlural", { count: commentCount }) : t("badges.comments", { count: commentCount }) },
    { type: "eclectic" as const, value: categoryCount, label: categoryCount > 1 ? t("badges.categoriesPlural", { count: categoryCount }) : t("badges.categories", { count: categoryCount }) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{t("badges.badgeProgress")}</p>
      <div className="flex gap-3">
        {progressItems.map(({ type, value, label }) => {
          const config = BADGE_CONFIG[type];
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <span>{config.emoji}</span>
              <span className={value > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
