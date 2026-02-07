import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Infinity as InfinityIcon, Zap } from "lucide-react";

interface VoteQuotaBarProps {
  voteCount: number;
  remainingVotes: number | "unlimited";
  tier: string;
}

export function VoteQuotaBar({ voteCount, remainingVotes, tier }: VoteQuotaBarProps) {
  const isUnlimited = remainingVotes === "unlimited";
  const max = isUnlimited ? 1 : voteCount + (remainingVotes as number);
  const pct = isUnlimited ? 100 : max > 0 ? (voteCount / max) * 100 : 0;

  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">
            {isUnlimited ? (
              <span className="flex items-center gap-1">
                <InfinityIcon className="h-3.5 w-3.5 text-primary" />
                Votes illimités
              </span>
            ) : (
              `${voteCount}/${max} votes cette semaine`
            )}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {!isUnlimited && (
        <Link
          to="/pricing"
          className="flex-shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Zap className="h-3 w-3" />
          Pro
        </Link>
      )}
    </div>
  );
}
