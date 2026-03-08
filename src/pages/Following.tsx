import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserMinus, Users, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArtistSuggestions } from "@/components/social/ArtistSuggestions";

interface FollowedArtist {
  id: string;
  following_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function Following() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<FollowedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: follows } = await supabase
      .from("follows")
      .select("id, following_id")
      .eq("follower_id", user.id);

    if (!follows || follows.length === 0) {
      setArtists([]);
      setLoading(false);
      return;
    }

    const followingIds = follows.map((f) => f.following_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .in("id", followingIds);

    const merged: FollowedArtist[] = follows.map((f) => {
      const profile = profiles?.find((p) => p.id === f.following_id);
      return {
        id: f.id,
        following_id: f.following_id,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || null,
      };
    });

    setArtists(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFollowing();
  }, [user, navigate, fetchFollowing]);

  const handleUnfollow = async (followId: string, artistName: string) => {
    setUnfollowingId(followId);
    try {
      await supabase.from("follows" as any).delete().eq("id", followId);
      setArtists((prev) => prev.filter((a) => a.id !== followId));
      toast.success(t("following.unfollowed", { name: artistName || "Artiste" }));
    } catch {
      toast.error(t("following.errorUnfollow", "Erreur lors du unfollow"));
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <Layout>
      <SEOHead
        title={t("following.pageTitle", "Artistes suivis")}
        description={t("following.pageDesc", "Retrouvez tous les artistes que vous suivez")}
      />

      <div className="container max-w-2xl py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("following.title", "Artistes suivis")}</h1>
            <p className="text-sm text-muted-foreground">
              {!loading && t("following.count", "{{count}} artiste(s)", { count: artists.length })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : artists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-1">{t("following.empty", "Aucun artiste suivi")}</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {t("following.emptyDesc", "Explorez et suivez des artistes pour les retrouver ici.")}
            </p>
            <Button onClick={() => navigate("/explore")} className="bg-gradient-primary">
              {t("following.explore", "Explorer")}
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {artists.map((artist) => (
                <motion.div
                  key={artist.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
                >
                  <button
                    onClick={() => navigate(`/artist/${artist.following_id}`)}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={artist.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(artist.display_name || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  <button
                    onClick={() => navigate(`/artist/${artist.following_id}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="font-semibold truncate">
                      {artist.display_name || t("following.unknownArtist", "Artiste")}
                    </p>
                    {artist.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{artist.bio}</p>
                    )}
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUnfollow(artist.id, artist.display_name || "")
                    }
                    disabled={unfollowingId === artist.id}
                    className="flex-shrink-0 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {unfollowingId === artist.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                    {t("follow.unfollow", "Ne plus suivre")}
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <ArtistSuggestions />
      </div>
      <Footer />
    </Layout>
  );
}
