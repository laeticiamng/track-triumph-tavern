import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useVoteStreak } from "@/hooks/use-vote-streak";
import { useAuth } from "@/hooks/use-auth";

interface StreakBadgeProps { showRecord?: boolean; compact?: boolean; }

export function StreakBadge({ showRecord = false, compact = false }: StreakBadgeProps) {
  const { user } = useAuth();
  const { currentStreak, longestStreak, loading } = useVoteStreak();
  const { t } = useTranslation();

  if (!user || loading || currentStreak === 0) return null;

  const streakLevel = currentStreak >= 10 ? "legendary" : currentStreak >= 5 ? "hot" : currentStreak >= 3 ? "warm" : "start";
  const colorMap = { start: "text-orange-400", warm: "text-orange-500", hot: "text-red-500", legendary: "text-amber-400" };
  const bgMap = { start: "bg-orange-500/10", warm: "bg-orange-500/15", hot: "bg-red-500/15", legendary: "bg-amber-400/20" };

  const label = currentStreak >= 10 ? t("streak.legendary") : currentStreak >= 5 ? t("streak.hot") : currentStreak >= 3 ? t("streak.warm") : t("streak.started");

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bgMap[streakLevel]} ${colorMap[streakLevel]}`}>
            <Flame className="h-3 w-3" />{currentStreak}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{t("streak.consecutiveVotes", { count: currentStreak })}</p>
          {showRecord && longestStreak > currentStreak && <p className="text-xs text-muted-foreground">{t("streak.record", { count: longestStreak })}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 rounded-xl border border-border p-3 ${bgMap[streakLevel]}`}>
      <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>
        <Flame className={`h-6 w-6 ${colorMap[streakLevel]}`} />
      </motion.div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${colorMap[streakLevel]}`}>{currentStreak}</span>
          <span className="text-sm font-medium">{currentStreak > 1 ? t("streak.weeksPlural") : t("streak.weeks")} {t("streak.inARow")}</span>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {showRecord && longestStreak > 0 && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t("streak.recordLabel")}</p>
          <p className="text-sm font-semibold">{longestStreak}</p>
        </div>
      )}
    </motion.div>
  );
}
