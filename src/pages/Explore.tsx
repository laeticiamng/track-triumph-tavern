import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, eventJsonLd } from "@/components/seo/SEOHead";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { VoteButton } from "@/components/vote/VoteButton";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekCountdown } from "@/components/shared/WeekCountdown";
import { Search, Music, Heart, ArrowRight, LayoutGrid, ListMusic, Sparkles, Calendar, Disc3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { WeeklyPodium } from "@/components/landing/WeeklyPodium";
import { ArtistSuggestions } from "@/components/social/ArtistSuggestions";
import { PopularArtists } from "@/components/social/PopularArtists";
import { maskVoteCount } from "@/lib/vote-utils";
import { useAuth } from "@/hooks/use-auth";
import { useVoteState } from "@/hooks/use-vote-state";
import { VoteFeed } from "@/components/vote/VoteFeed";
import { VoteQuotaBar } from "@/components/vote/VoteQuotaBar";
import { CategoryProgressBar } from "@/components/vote/CategoryProgressBar";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { BadgeProgress } from "@/components/gamification/BadgeProgress";
import { useSubscription } from "@/hooks/use-subscription";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { PlatformPulse } from "@/components/explore/PlatformPulse";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;
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
  preview_start_sec?: number;
  preview_end_sec?: number;
}

const Explore = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedSubmissions, setFeedSubmissions] = useState<FeedSubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeWeek, setActiveWeek] = useState<Tables<"weeks"> | null>(null);
  const [noActiveWeek, setNoActiveWeek] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [showRecsOnly, setShowRecsOnly] = useState(false);

  // Mode: "listen" (grid) or "vote" (feed)
  const mode = searchParams.get("mode") === "vote" ? "vote" : "listen";
  const setMode = (m: "listen" | "vote") => {
    const params = new URLSearchParams(searchParams);
    if (m === "vote") params.set("mode", "vote");
    else params.delete("mode");
    setSearchParams(params, { replace: true });
  };

  const activeCategorySlug = searchParams.get("category") || "all";
  const activeCategoryId = activeCategorySlug === "all"
    ? "all"
    : categories.find((c) => c.slug === activeCategorySlug)?.id || null;

  const voteState = useVoteState(activeWeek?.id || null);
  const { tier: subTier } = useSubscription();
  const showChatbot = subTier === "pro" || subTier === "elite";

  // Load active week + categories
  useEffect(() => {
    Promise.all([
      supabase.from("weeks").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("categories").select("*").order("sort_order"),
    ]).then(([weekRes, catRes]) => {
      if (weekRes.data) {
        setActiveWeek(weekRes.data);
      } else {
        setNoActiveWeek(true);
        setLoading(false);
      }
      if (catRes.data) setCategories(catRes.data);
      if (!weekRes.data) setLoading(false);
    }).catch((err: unknown) => {
      console.error("[Explore] Failed to load week/categories:", err instanceof Error ? err.message : err);
      setNoActiveWeek(true);
      setLoading(false);
    });
  }, []);

  // Load submissions
  useEffect(() => {
    if (!activeWeek) return;
    if (activeCategorySlug !== "all" && categories.length === 0) return;
    setLoading(true);

    let query = supabase
      .from("submissions")
      .select("*")
      .eq("status", "approved")
      .eq("week_id", activeWeek.id)
      .order("created_at", { ascending: false });

    if (activeCategoryId && activeCategoryId !== "all") {
      query = query.eq("category_id", activeCategoryId);
    }

    Promise.resolve(query).then(async ({ data }) => {
      const subs = data || [];
      setSubmissions(subs);

      // Build feed submissions with avatars + category names
      if (subs.length > 0) {
        const catMap = new Map(categories.map((c) => [c.id, c.name]));
        const userIds = [...new Set(subs.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, avatar_url")
          .in("id", userIds);
        const avatarMap = new Map(profiles?.map((p) => [p.id, p.avatar_url]) ?? []);

        setFeedSubmissions(subs.map((s) => ({
          id: s.id,
          title: s.title,
          artist_name: s.artist_name,
          cover_image_url: s.cover_image_url,
          audio_excerpt_url: s.audio_excerpt_url,
          tags: s.tags,
          user_id: s.user_id,
          category_id: s.category_id,
          category_name: catMap.get(s.category_id) || "—",
          artist_avatar: avatarMap.get(s.user_id) || null,
          preview_start_sec: s.preview_start_sec ?? undefined,
          preview_end_sec: s.preview_end_sec ?? undefined,
        })));
      } else {
        setFeedSubmissions([]);
      }
      setLoading(false);
    }).catch((err: unknown) => {
      console.error("[Explore] Failed to load submissions:", err instanceof Error ? err.message : err);
      setSubmissions([]);
      setFeedSubmissions([]);
      setLoading(false);
    });
  }, [activeCategorySlug, activeCategoryId, activeWeek, categories]);

  const filtered = submissions.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFeed = showRecsOnly && recommendedIds.length > 0
    ? feedSubmissions.filter((s) => recommendedIds.includes(s.id))
    : feedSubmissions.filter((s) =>
        !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist_name.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <Layout>
      <SEOHead
        title={mode === "vote" ? t("votePage.seoTitle") : t("explore.seoTitle")}
        description={mode === "vote" ? t("votePage.seoDesc") : t("explore.seoDesc")}
        url="/explore"
        jsonLd={activeWeek ? eventJsonLd(activeWeek) : undefined}
      />
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container px-4 sm:px-6">
          {/* Header + mode toggle */}
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
                  {t("explore.title")}
                </h1>
                <p className="mt-1 text-muted-foreground">{t("explore.subtitle")}</p>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center rounded-xl border border-border bg-secondary/50 p-1">
                <button
                  onClick={() => setMode("listen")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    mode === "listen"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  {t("explore.modeListen")}
                </button>
                <button
                  onClick={() => setMode("vote")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    mode === "vote"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  {t("explore.modeVote")}
                </button>
              </div>
            </div>

            {activeWeek?.voting_close_at && (
              <div className="mt-3">
                <WeekCountdown
                  targetDate={activeWeek.voting_close_at}
                  label={t("countdown.voteEndIn")}
                  className="text-primary"
                />
              </div>
            )}
          </div>

          {/* Vote mode controls */}
          {mode === "vote" && (
            <div className="mb-4 space-y-2">
              {!user && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{t("votePage.loginBanner")}</span>
                  </div>
                  <Link
                    to="/auth?tab=signup&redirect=/explore?mode=vote"
                    className="flex-shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {t("votePage.signUpFree")}
                  </Link>
                </div>
              )}
              {user && (
                <VoteQuotaBar
                  voteCount={voteState.voteCount}
                  remainingVotes={voteState.remainingVotes}
                  tier={voteState.tier}
                />
              )}
              {user && <StreakBadge showRecord />}
              {user && categories.length > 0 && voteState.votedCategories.size > 0 && (
                <CategoryProgressBar
                  categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                  votedCategories={voteState.votedCategories}
                />
              )}
              {user && <BadgeProgress weekId={activeWeek?.id || null} />}
              {user && (voteState.tier === "pro" || voteState.tier === "elite") && (
                <AIRecommendations weekId={activeWeek?.id || null} onRecommendations={setRecommendedIds} />
              )}
            </div>
          )}

          <PlatformPulse activeWeekId={activeWeek?.id || null} />

          {/* Podium (listen mode only) */}
          {mode === "listen" && <WeeklyPodium compact />}

          {/* Search (listen mode) */}
          {mode === "listen" && (
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("explore.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Category filters */}
          <div className="mb-6 flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => { setSearchParams(mode === "vote" ? { mode: "vote" } : {}); setShowRecsOnly(false); }}
              className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategorySlug === "all" && !showRecsOnly
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {t("explore.all")}
            </button>
            {mode === "vote" && recommendedIds.length > 0 && (
              <button
                onClick={() => setShowRecsOnly(!showRecsOnly)}
                className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                  showRecsOnly
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                <Sparkles className="h-3 w-3" /> {t("votePage.forYou")}
              </button>
            )}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const params: Record<string, string> = { category: cat.slug };
                  if (mode === "vote") params.mode = "vote";
                  setSearchParams(params);
                  setShowRecsOnly(false);
                }}
                className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategorySlug === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Content area */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : (noActiveWeek || (filtered.length === 0 && feedSubmissions.length === 0)) ? (
              <EngagingEmptyState
                noActiveWeek={noActiveWeek}
                hasFilter={activeCategorySlug !== "all"}
                votingCloseAt={activeWeek?.voting_close_at || null}
                categories={categories}
              />
            ) : mode === "listen" ? (
              /* ===== GRID VIEW ===== */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link
                      to={`/submissions/${sub.id}`}
                      className="group card-elevated border-gradient-hover overflow-hidden block"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={sub.cover_image_url}
                          alt={sub.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="truncate font-display text-lg font-semibold text-white">{sub.title}</h3>
                          <p className="truncate text-sm text-white/70">{sub.artist_name}</p>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <AudioPlayer src={sub.audio_excerpt_url} compact />
                        <div className="flex items-center justify-between" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {maskVoteCount(sub.vote_count, activeWeek?.voting_close_at)}
                          </span>
                          <VoteButton submissionId={sub.id} categoryId={sub.category_id} compact />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* ===== VOTE FEED VIEW ===== */
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
                      <Music className="h-10 w-10 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{t("votePage.contestStartsSoon")}</h3>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("votePage.tracksWillAppear")}</p>
                  </div>
                ) : (
                  <VoteFeed
                    submissions={filteredFeed}
                    canVote={voteState.canVote}
                    votedCategories={voteState.votedCategories}
                    onVoted={voteState.recordVote}
                    isAuthenticated={!!user}
                    tier={voteState.tier}
                    commentsUsed={voteState.commentsUsed}
                    commentsMax={voteState.commentsMax}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social */}
          <ArtistSuggestions />
          <PopularArtists />
        </div>
      </section>
      <Footer />
      {showChatbot && <AIChatbot />}
    </Layout>
  );
};

/**
 * Engaging empty state with category teasers and countdown
 */
function EngagingEmptyState({
  noActiveWeek,
  hasFilter,
  votingCloseAt,
  categories,
}: {
  noActiveWeek: boolean;
  hasFilter: boolean;
  votingCloseAt: string | null;
  categories: Category[];
}) {
  const { t } = useTranslation();

  // Category icons for visual teasers
  const categoryIcons: Record<string, string> = {
    "rap-trap": "🎤", pop: "🎵", afro: "🥁", electronic: "🎧",
    "r-b": "💜", lofi: "🌙", "rock-indie": "🎸", open: "🌍",
    dj: "💿", reggae: "🌴", country: "🤠", jazz: "🎷",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/30">
          <Disc3 className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "4s" }} />
          <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
      </motion.div>

      <h3 className="font-display text-2xl font-bold">
        {noActiveWeek ? t("explore.noActiveContest") : t("explore.contestStartsSoon")}
      </h3>
      <p className="mt-2 max-w-md text-muted-foreground leading-relaxed">
        {noActiveWeek
          ? t("explore.emptyStateDesc")
          : hasFilter
            ? t("explore.noCategorySubmissions")
            : t("explore.noSubmissionsYet")}
      </p>

      {/* Countdown if available */}
      {votingCloseAt && !noActiveWeek && (
        <div className="mt-6 rounded-2xl border border-border bg-secondary/30 px-6 py-4">
          <WeekCountdown
            targetDate={votingCloseAt}
            label={t("explore.weekEndsIn")}
            variant="hero"
            className="text-foreground"
          />
        </div>
      )}

      {/* Category teasers */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 w-full max-w-2xl"
        >
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("explore.upcomingCategories")}
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 px-4 sm:px-0">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              >
                <span className="text-2xl">
                  {categoryIcons[cat.slug] || "🎵"}
                </span>
                <span className="text-xs font-medium text-foreground group-hover:text-primary truncate w-full text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          to="/auth?tab=signup"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("explore.joinContest")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/about"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          {t("explore.learnMoreLink")}
        </Link>
      </div>
    </div>
  );
}

export default Explore;
