import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useWeeklyBadges, BADGE_CONFIG, type BadgeType, type WeeklyBadge } from "@/hooks/use-weekly-badges";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Award } from "lucide-react";

interface BadgeShowcaseProps { userId?: string; weekId?: string | null; compact?: boolean; showEmpty?: boolean; }

export function BadgeShowcase({ userId, weekId, compact = false, showEmpty = false }: BadgeShowcaseProps) {
  const { badges, loading } = useWeeklyBadges(userId, weekId);
  const { t } = useTranslation();

  if (loading) return null;
  if (badges.length === 0 && !showEmpty) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {badges.slice(0, 4).map((badge) => <BadgeIcon key={badge.id} badge={badge} size="sm" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("badges.weeklyBadges")}</h3>
        <span className="text-xs text-muted-foreground">({badges.length})</span>
      </div>
      {badges.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t("badges.noBadges")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => <BadgeIcon key={badge.id} badge={badge} size="md" />)}
        </div>
      )}
    </div>
  );
}

function BadgeIcon({ badge, size }: { badge: WeeklyBadge; size: "sm" | "md" }) {
  const config = BADGE_CONFIG[badge.badge_type as BadgeType];
  if (!config) return null;
  const sizeClasses = size === "sm" ? "h-7 w-7 text-sm" : "h-10 w-10 text-lg";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`flex items-center justify-center rounded-full bg-gradient-to-br ${config.color} ${sizeClasses} cursor-default shadow-md`} whileHover={{ scale: 1.15 }}>
          <span>{config.emoji}</span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-center">
        <p className="font-semibold">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function BadgePills({ userId }: { userId?: string }) {
  const { badges } = useWeeklyBadges(userId);
  if (badges.length === 0) return null;
  const latestWeek = badges[0]?.week_id;
  const latestBadges = badges.filter(b => b.week_id === latestWeek);

  return (
    <div className="flex items-center gap-0.5">
      {latestBadges.map((b) => {
        const config = BADGE_CONFIG[b.badge_type as BadgeType];
        return config ? (
          <Tooltip key={b.id}>
            <TooltipTrigger asChild><span className="text-xs cursor-default">{config.emoji}</span></TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>
        ) : null;
      })}
    </div>
  );
}
