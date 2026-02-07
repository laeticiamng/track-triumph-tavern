import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers";

interface VoteState {
  votedCategories: Set<string>;
  voteCount: number;
  loading: boolean;
  canVote: (categoryId: string) => boolean;
  remainingVotes: number | "unlimited";
  recordVote: (categoryId: string) => void;
  tier: string;
  commentsUsed: number;
  commentsMax: number | "unlimited";
}

export function useVoteState(activeWeekId: string | null): VoteState {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [votedCategories, setVotedCategories] = useState<Set<string>>(new Set());
  const [voteCount, setVoteCount] = useState(0);
  const [commentsUsed, setCommentsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const maxVotes = SUBSCRIPTION_TIERS[tier]?.limits.votes_per_week ?? 5;

  useEffect(() => {
    if (!user || !activeWeekId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("votes")
      .select("category_id, comment")
      .eq("user_id", user.id)
      .eq("week_id", activeWeekId)
      .then(({ data }) => {
        if (data) {
          const cats = new Set(data.map((v) => v.category_id));
          setVotedCategories(cats);
          setVoteCount(data.length);
          setCommentsUsed(data.filter((v) => v.comment && v.comment.trim().length > 0).length);
        }
        setLoading(false);
      });
  }, [user, activeWeekId]);

  const canVote = useCallback(
    (categoryId: string) => {
      if (!user) return false;
      if (votedCategories.has(categoryId)) return false;
      if (maxVotes === Infinity) return true;
      return voteCount < maxVotes;
    },
    [user, votedCategories, voteCount, maxVotes]
  );

  const remainingVotes = useMemo(() => {
    if (maxVotes === Infinity) return "unlimited" as const;
    return Math.max(0, maxVotes - voteCount);
  }, [maxVotes, voteCount]);

  const recordVote = useCallback((categoryId: string, hadComment?: boolean) => {
    setVotedCategories((prev) => new Set(prev).add(categoryId));
    setVoteCount((prev) => prev + 1);
    if (hadComment) setCommentsUsed((prev) => prev + 1);
  }, []);

  const commentsMax = useMemo(() => {
    const limit = SUBSCRIPTION_TIERS[tier]?.limits.comments_per_week ?? 0;
    return limit === Infinity ? ("unlimited" as const) : limit;
  }, [tier]);

  return { votedCategories, voteCount, loading, canVote, remainingVotes, recordVote, tier, commentsUsed, commentsMax };
}
