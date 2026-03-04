import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, TrendingUp, Music } from "lucide-react";
import { motion } from "framer-motion";

interface PopularArtist {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  submission_count: number;
  category_name: string;
}

export function PopularArtists() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<PopularArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Get approved submissions with their categories
        const { data: submissions } = await supabase
          .from("submissions_public")
          .select("user_id, category_id")
          .eq("status", "approved")
          .limit(500);

        if (!submissions || submissions.length === 0) {
          setLoading(false);
          return;
        }

        // Count submissions per user and find their top category
        const userMap = new Map<string, { count: number; categories: Map<string, number> }>();
        for (const sub of submissions) {
          if (!sub.user_id) continue;
          if (!userMap.has(sub.user_id)) {
            userMap.set(sub.user_id, { count: 0, categories: new Map() });
          }
          const entry = userMap.get(sub.user_id)!;
          entry.count++;
          entry.categories.set(sub.category_id!, (entry.categories.get(sub.category_id!) || 0) + 1);
        }

        // Top 6 by submission count
        const topUserIds = [...userMap.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 6)
          .map(([uid]) => uid);

        if (topUserIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", topUserIds);

        // Fetch category names
        const allCatIds = new Set<string>();
        for (const [, entry] of userMap) {
          for (const catId of entry.categories.keys()) allCatIds.add(catId);
        }
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", [...allCatIds]);

        const catNameMap = new Map((categories || []).map((c) => [c.id, c.name]));

        const result: PopularArtist[] = topUserIds.map((uid) => {
          const profile = profiles?.find((p) => p.id === uid);
          const entry = userMap.get(uid)!;
          // Find top category
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
            submission_count: entry.count,
            category_name: catNameMap.get(topCatId) || "",
          };
        });

        setArtists(result);
      } catch (err) {
        console.error("PopularArtists error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (!loading && artists.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">
          {t("popular.title", "Artistes populaires")}
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist, i) => (
            <motion.button
              key={artist.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/30 text-left"
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={artist.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {(artist.display_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {artist.display_name || t("following.unknownArtist", "Artiste")}
                </p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  {artist.category_name} · {t("following.submissions", "{{count}} soumission(s)", { count: artist.submission_count })}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
