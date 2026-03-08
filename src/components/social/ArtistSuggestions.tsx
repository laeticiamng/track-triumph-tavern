import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Sparkles, RefreshCw, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SuggestedArtist {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  category_name: string;
  submission_count: number;
  vote_count: number;
}

export function ArtistSuggestions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<SuggestedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get categories the user has voted in
      const { data: votes } = await supabase
        .from("votes")
        .select("category_id")
        .eq("user_id", user.id);

      if (!votes || votes.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const votedCategoryIds = [...new Set(votes.map((v) => v.category_id))];

      // 2. Get users the current user already follows
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const alreadyFollowing = new Set(
        (follows || []).map((f) => f.following_id)
      );
      alreadyFollowing.add(user.id); // exclude self
      setFollowingIds(alreadyFollowing);

      // 3. Get approved submissions in those categories from other users
      const { data: submissions } = await supabase
        .from("submissions")
        .select("user_id, category_id, vote_count")
        .in("category_id", votedCategoryIds)
        .eq("status", "approved")
        .limit(200);

      if (!submissions || submissions.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // 4. Count submissions per user per category, exclude already followed
      const userCategoryMap = new Map<string, { categories: Map<string, number>; total: number; votes: number }>();

      for (const sub of submissions) {
        if (alreadyFollowing.has(sub.user_id)) continue;

        if (!userCategoryMap.has(sub.user_id)) {
          userCategoryMap.set(sub.user_id, { categories: new Map(), total: 0, votes: 0 });
        }
        const entry = userCategoryMap.get(sub.user_id)!;
        entry.categories.set(sub.category_id, (entry.categories.get(sub.category_id) || 0) + 1);
        entry.total++;
        entry.votes += sub.vote_count || 0;
      }

      // 5. Sort by submission count, take top 6
      const topUserIds = [...userCategoryMap.entries()]
        .sort((a, b) => b[1].votes - a[1].votes)
        .slice(0, 6)
        .map(([uid]) => uid);

      if (topUserIds.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // 6. Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio")
        .in("id", topUserIds);

      // 7. Fetch category names for labeling
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", votedCategoryIds);

      const categoryNameMap = new Map((categories || []).map((c) => [c.id, c.name]));

      // 8. Build suggestions
      const result: SuggestedArtist[] = topUserIds.map((uid) => {
        const profile = profiles?.find((p) => p.id === uid);
        const entry = userCategoryMap.get(uid)!;
        // Find the most common category
        let topCatId = "";
        let topCatCount = 0;
        for (const [catId, count] of entry.categories) {
          if (count > topCatCount) {
            topCatId = catId;
            topCatCount = count;
          }
        }

        return {
          id: uid,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          bio: profile?.bio || null,
          category_name: categoryNameMap.get(topCatId) || "",
          submission_count: entry.total,
          vote_count: entry.votes,
        };
      });

      setSuggestions(result);
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const handleFollow = async (artistId: string) => {
    if (!user) return;
    setFollowLoadingId(artistId);
    try {
      await supabase
        .from("follows" as any)
        .insert({ follower_id: user.id, following_id: artistId } as any);

      setFollowingIds((prev) => new Set([...prev, artistId]));
      setSuggestions((prev) => prev.filter((a) => a.id !== artistId));
      toast.success(t("following.followed", "Artiste suivi !"));
    } catch {
      toast.error(t("following.errorFollow", "Erreur"));
    } finally {
      setFollowLoadingId(null);
    }
  };

  if (!user || (suggestions.length === 0 && !loading)) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">
            {t("following.suggestions", "Suggestions pour vous")}
          </h2>
        </div>
        {!loading && suggestions.length > 0 && (
          <Button variant="ghost" size="sm" onClick={fetchSuggestions} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("following.refresh", "Actualiser")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/30"
            >
              <button
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="relative flex-shrink-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={artist.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {(artist.display_name || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  i === 0 ? "bg-yellow-500 text-yellow-950" :
                  i === 1 ? "bg-gray-300 text-gray-700" :
                  i === 2 ? "bg-amber-600 text-amber-50" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
              </button>

              <button
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-semibold truncate">
                  {artist.display_name || t("following.unknownArtist", "Artiste")}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {artist.category_name} · {t("following.submissions", "{{count}} soumission(s)", { count: artist.submission_count })}
                </p>
                <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {t("following.votesReceived", "{{count}} vote(s) reçu(s)", { count: artist.vote_count })}
                </p>
              </button>

              <Button
                size="sm"
                onClick={() => handleFollow(artist.id)}
                disabled={followLoadingId === artist.id}
                className="flex-shrink-0 gap-1 bg-gradient-primary hover:opacity-90 text-xs"
              >
                {followLoadingId === artist.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                {t("follow.follow", "Suivre")}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
