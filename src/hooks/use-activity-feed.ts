import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export interface ActivityWithProfile {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Get followed user IDs
    const { data: followData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followedIds = (followData || []).map((f) => f.following_id);

    if (followedIds.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Get activities from followed users
    const { data: activityData } = await supabase
      .from("activities")
      .select("*")
      .in("user_id", followedIds)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!activityData || activityData.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Get profiles for these users
    const userIds = [...new Set(activityData.map((a) => a.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const enriched: ActivityWithProfile[] = activityData.map((a) => {
      const profile = profileMap.get(a.user_id);
      return {
        ...a,
        metadata: (a.metadata as Record<string, unknown>) || {},
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
      };
    });

    setActivities(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Realtime for new activities
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("activity-feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        () => {
          fetchFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFeed]);

  return { activities, loading, refetch: fetchFeed };
}
