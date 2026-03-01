import { useBadgeProgress } from "@/hooks/use-weekly-badges";
import { BADGE_CONFIG } from "@/hooks/use-weekly-badges";
import { motion } from "framer-motion";

interface BadgeProgressProps {
  weekId?: string | null;
}

export function BadgeProgress({ weekId }: BadgeProgressProps) {
  const { voteCount, commentCount, categoryCount } = useBadgeProgress(weekId);

  if (voteCount === 0) return null;

  const progressItems = [
    { type: "top_voter" as const, value: voteCount, label: `${voteCount} vote${voteCount > 1 ? "s" : ""}` },
    { type: "critic" as const, value: commentCount, label: `${commentCount} commentaire${commentCount > 1 ? "s" : ""}` },
    { type: "eclectic" as const, value: categoryCount, label: `${categoryCount} catégorie${categoryCount > 1 ? "s" : ""}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3 space-y-2"
    >
      <p className="text-xs font-semibold text-muted-foreground">Progression badges</p>
      <div className="flex gap-3">
        {progressItems.map(({ type, value, label }) => {
          const config = BADGE_CONFIG[type];
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <span>{config.emoji}</span>
              <span className={value > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
