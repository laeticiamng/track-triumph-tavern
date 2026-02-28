import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useVoteStreak } from "@/hooks/use-vote-streak";
import { useAuth } from "@/hooks/use-auth";

interface StreakBadgeProps {
  /** Show the longest streak alongside */
  showRecord?: boolean;
  /** Compact mode for header */
  compact?: boolean;
}

export function StreakBadge({ showRecord = false, compact = false }: StreakBadgeProps) {
  const { user } = useAuth();
  const { currentStreak, longestStreak, loading } = useVoteStreak();

  if (!user || loading || currentStreak === 0) return null;

  const streakLevel =
    currentStreak >= 10 ? "legendary" :
    currentStreak >= 5 ? "hot" :
    currentStreak >= 3 ? "warm" : "start";

  const colorMap = {
    start: "text-orange-400",
    warm: "text-orange-500",
    hot: "text-red-500",
    legendary: "text-amber-400",
  };

  const bgMap = {
    start: "bg-orange-500/10",
    warm: "bg-orange-500/15",
    hot: "bg-red-500/15",
    legendary: "bg-amber-400/20",
  };

  const label =
    currentStreak >= 10 ? "Légendaire 🏆" :
    currentStreak >= 5 ? "En feu 🔥" :
    currentStreak >= 3 ? "Bien parti ! 💪" : "Série en cours";

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bgMap[streakLevel]} ${colorMap[streakLevel]}`}
          >
            <Flame className="h-3 w-3" />
            {currentStreak}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {currentStreak} semaine{currentStreak > 1 ? "s" : ""} de vote consécutives
          </p>
          {showRecord && longestStreak > currentStreak && (
            <p className="text-xs text-muted-foreground">Record : {longestStreak} semaines</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 rounded-xl border border-border p-3 ${bgMap[streakLevel]}`}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Flame className={`h-6 w-6 ${colorMap[streakLevel]}`} />
      </motion.div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${colorMap[streakLevel]}`}>
            {currentStreak}
          </span>
          <span className="text-sm font-medium">
            semaine{currentStreak > 1 ? "s" : ""} de suite
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {showRecord && longestStreak > 0 && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Record</p>
          <p className="text-sm font-semibold">{longestStreak}</p>
        </div>
      )}
    </motion.div>
  );
}
