import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type BadgeType = "top_voter" | "discoverer" | "critic" | "eclectic";

export interface WeeklyBadge {
  id: string;
  user_id: string;
  week_id: string;
  badge_type: BadgeType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const BADGE_CONFIG: Record<BadgeType, { emoji: string; labelKey: string; descriptionKey: string; color: string }> = {
  top_voter: { emoji: "🏆", labelKey: "badgeTypes.topVoterLabel", descriptionKey: "badgeTypes.topVoterDesc", color: "from-yellow-500 to-amber-600" },
  discoverer: { emoji: "🔍", labelKey: "badgeTypes.discovererLabel", descriptionKey: "badgeTypes.discovererDesc", color: "from-blue-500 to-cyan-600" },
  critic: { emoji: "📝", labelKey: "badgeTypes.criticLabel", descriptionKey: "badgeTypes.criticDesc", color: "from-purple-500 to-pink-600" },
  eclectic: { emoji: "🌈", labelKey: "badgeTypes.eclecticLabel", descriptionKey: "badgeTypes.eclecticDesc", color: "from-green-500 to-emerald-600" },
};

export function useWeeklyBadges(userId?: string, weekId?: string | null) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [badges, setBadges] = useState<WeeklyBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) { setLoading(false); return; }

    let query = supabase
      .from("weekly_badges")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (weekId) {
      query = query.eq("week_id", weekId);
    }

    Promise.resolve(query)
      .then(({ data }) => {
        setBadges((data as unknown as WeeklyBadge[]) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [targetUserId, weekId]);

  return { badges, loading };
}

/** Real-time badge progress for the current week */
export function useBadgeProgress(weekId?: string | null) {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    voteCount: number;
    commentCount: number;
    categoryCount: number;
  }>({ voteCount: 0, commentCount: 0, categoryCount: 0 });

  useEffect(() => {
    if (!user || !weekId) return;

    Promise.resolve(
      supabase
        .from("votes")
        .select("id, category_id, comment")
        .eq("user_id", user.id)
        .eq("week_id", weekId)
    )
      .then(({ data }) => {
        if (!data) return;
        const categories = new Set(data.map(v => v.category_id));
        const comments = data.filter(v => v.comment && v.comment.trim().length > 0);
        setStats({
          voteCount: data.length,
          commentCount: comments.length,
          categoryCount: categories.size,
        });
      })
      .catch(() => {});
  }, [user, weekId]);

  return stats;
}
