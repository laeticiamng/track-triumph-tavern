import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useVoteState } from "@/hooks/use-vote-state";
import { VoteFeed } from "@/components/vote/VoteFeed";
import { VoteQuotaBar } from "@/components/vote/VoteQuotaBar";
import { CategoryProgressBar } from "@/components/vote/CategoryProgressBar";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { SEOHead, eventJsonLd } from "@/components/seo/SEOHead";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

interface FeedSubmission {
  id: string;
  title: string;
  artist_name: string;
  cover_image_url: string;
  audio_excerpt_url: string;
  tags: string[] | null;
  user_id: string;
  category_id: string;
  category_name: string;
  artist_avatar: string | null;
  preview_start_sec: number;
  preview_end_sec: number;
}

const Vote = () => {
  const { user } = useAuth();
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<Tables<"weeks"> | null>(null);
  const [submissions, setSubmissions] = useState<FeedSubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [showRecsOnly, setShowRecsOnly] = useState(false);

  const voteState = useVoteState(activeWeekId);

  // Load active week + categories
  useEffect(() => {
    Promise.all([
      supabase.from("weeks").select("*").eq("is_active", true).single(),
      supabase.from("categories").select("*").order("sort_order"),
    ]).then(([weekRes, catRes]) => {
      if (weekRes.data) {
        setActiveWeekId(weekRes.data.id);
        setActiveWeek(weekRes.data);
      }
      if (catRes.data) setCategories(catRes.data);
      if (!weekRes.data) setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Load submissions when week is set
  useEffect(() => {
    if (!activeWeekId) return;
    setLoading(true);

    let query = supabase
      .from("submissions")
      .select("id, title, artist_name, cover_image_url, audio_excerpt_url, tags, user_id, category_id, preview_start_sec, preview_end_sec")
      .eq("status", "approved")
      .eq("week_id", activeWeekId)
      .order("created_at", { ascending: false });

    if (activeFilter !== "all") {
      query = query.eq("category_id", activeFilter);
    }

    query.then(async ({ data }) => {
      if (!data || data.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Get category names map
      const catMap = new Map(categories.map((c) => [c.id, c.name]));

      // Get profiles for avatars
      const userIds = [...new Set(data.map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", userIds);

      const avatarMap = new Map(profiles?.map((p) => [p.id, p.avatar_url]) ?? []);

      const feed: FeedSubmission[] = data.map((s) => ({
        ...s,
        category_name: catMap.get(s.category_id) || "—",
        artist_avatar: avatarMap.get(s.user_id) || null,
      }));

      setSubmissions(feed);
      setLoading(false);
    });
  }, [activeWeekId, activeFilter, categories]);

  const filtered = showRecsOnly && recommendedIds.length > 0
    ? submissions.filter((s) => recommendedIds.includes(s.id))
    : submissions;

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <SEOHead
        title="Voter"
        description="Écoutez et votez pour vos morceaux préférés dans 9 catégories musicales."
        url="/vote"
        jsonLd={activeWeek ? eventJsonLd(activeWeek) : undefined}
      />
      <Header />

      {/* Overlay controls */}
      <div className="fixed top-16 left-0 right-0 z-40 px-4 pt-3 pb-2 space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          <VoteQuotaBar
            voteCount={voteState.voteCount}
            remainingVotes={voteState.remainingVotes}
            tier={voteState.tier}
          />
        </div>

        {/* Category vote progress */}
        {user && categories.length > 0 && voteState.votedCategories.size > 0 && (
          <div className="pointer-events-auto">
            <CategoryProgressBar
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              votedCategories={voteState.votedCategories}
            />
          </div>
        )}

        {/* Category filter pills + AI recommendations */}
        <div className="pointer-events-auto flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => { setActiveFilter("all"); setShowRecsOnly(false); }}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === "all" && !showRecsOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            Tout
          </button>
          {recommendedIds.length > 0 && (
            <button
              onClick={() => { setShowRecsOnly(!showRecsOnly); setActiveFilter("all"); }}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                showRecsOnly
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <Sparkles className="h-3 w-3" /> Pour vous
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveFilter(cat.id); setShowRecsOnly(false); }}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {/* AI Recommendations loader (Pro/Elite only) */}
        {user && (voteState.tier === "pro" || voteState.tier === "elite") && (
          <div className="pointer-events-auto">
            <AIRecommendations weekId={activeWeekId} onRecommendations={setRecommendedIds} />
          </div>
        )}
      </div>

      {/* Feed area */}
      <main className="flex-1 pt-16 pb-16 md:pb-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
              <Music className="h-10 w-10 text-accent-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold">Le concours démarre bientôt</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Les morceaux de la semaine apparaîtront ici dès qu'ils seront approuvés. Inscrivez-vous pour être notifié !
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/auth?tab=signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Rejoindre le concours
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Comment ça marche ?
              </Link>
            </div>
          </div>
        ) : (
          <VoteFeed
            submissions={filtered}
            canVote={voteState.canVote}
            votedCategories={voteState.votedCategories}
            onVoted={voteState.recordVote}
            isAuthenticated={!!user}
            tier={voteState.tier}
            commentsUsed={voteState.commentsUsed}
            commentsMax={voteState.commentsMax}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Vote;
