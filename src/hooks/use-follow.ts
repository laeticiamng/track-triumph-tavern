import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;

    const load = async () => {
      // Follower count
      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);
      setFollowerCount(followers || 0);

      // Following count
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);
      setFollowingCount(following || 0);

      // Is current user following?
      if (user && user.id !== targetUserId) {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .maybeSingle();
        setIsFollowing(!!data);
      }
    };

    load();
  }, [targetUserId, user]);

  const toggleFollow = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId || loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetUserId });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing, loading]);

  return { isFollowing, followerCount, followingCount, toggleFollow, loading, canFollow: !!user && user.id !== targetUserId };
}
