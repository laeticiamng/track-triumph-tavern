import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface VoteStreak {
  currentStreak: number;
  longestStreak: number;
  loading: boolean;
}

export function useVoteStreak(): VoteStreak {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setLoading(false);
      return;
    }

    Promise.resolve(
      supabase
        .from("vote_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle()
    )
      .then(({ data }) => {
        if (data) {
          setCurrentStreak(data.current_streak);
          setLongestStreak(data.longest_streak);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  return { currentStreak, longestStreak, loading };
}
