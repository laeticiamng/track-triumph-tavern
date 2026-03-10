import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Sparkles, ChevronRight, DollarSign, Gift, Play, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

/* ─── Confetti Particle ─── */
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 100;
  const rotation = Math.random() * 720 - 360;
  const size = 6 + Math.random() * 8;
  const duration = 2.5 + Math.random() * 2;

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        left: `${x}%`,
        top: -20,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: rotation,
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration,
        delay,
        ease: "easeIn",
      }}
    />
  );
}

function ConfettiExplosion({ active }: { active: boolean }) {
  const colors = [
    "hsl(263, 70%, 62%)",
    "hsl(38, 92%, 55%)",
    "hsl(142, 72%, 45%)",
    "hsl(0, 72%, 51%)",
    "hsl(200, 85%, 55%)",
    "hsl(290, 80%, 65%)",
    "hsl(50, 90%, 55%)",
  ];

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {Array.from({ length: 80 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={Math.random() * 0.8}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  );
}

/* ─── Countdown Display ─── */
function CountdownOverlay({
  count,
  onComplete,
}: {
  count: number;
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(count);

  useEffect(() => {
    if (current <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCurrent((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [current, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {current > 0 ? (
        <motion.div
          key={current}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="relative"
          >
            <span className="font-display text-[12rem] font-black text-gradient leading-none">
              {current}
            </span>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--gradient-primary)", filter: "blur(80px)", opacity: 0.3 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ─── Category Reveal Card ─── */
function CategoryReveal({
  category,
  winners,
  rewards,
  index,
  isActive,
  isRevealed,
}: {
  category: Tables<"categories">;
  winners: Array<Tables<"winners"> & { submissions: { title: string; artist_name: string; cover_image_url: string } | null }>;
  rewards: Tables<"rewards">[];
  index: number;
  isActive: boolean;
  isRevealed: boolean;
}) {
  const { t } = useTranslation();
  const podiumEmojis = ["🥇", "🥈", "🥉"];

  const getReward = (winnerId: string) =>
    rewards.find((r) => r.winner_id === winnerId);

  if (!isRevealed && !isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.4, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-muted-foreground/50" />
          <span className="font-display text-lg text-muted-foreground/50">{category.name}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/30">
          {t("reveal.waiting", "En attente du reveal...")}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "backOut" }}
    >
      <Card className={`overflow-hidden transition-all duration-500 ${
        isActive ? "ring-2 ring-primary shadow-glow" : ""
      }`}>
        {/* Category Header */}
        <div className="relative overflow-hidden bg-gradient-primary px-6 py-4">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(0_0%_100%/0.15),transparent)]"
            animate={{ x: ["-50%", "150%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <div className="relative flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary-foreground" />
            <h3 className="font-display text-xl font-bold text-primary-foreground">
              {category.name}
            </h3>
            {isActive && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-auto"
              >
                <Sparkles className="h-5 w-5 text-primary-foreground/80" />
              </motion.div>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <AnimatePresence>
            {winners.map((w, i) => {
              const reward = getReward(w.id);
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: isActive ? (winners.length - 1 - i) * 0.8 : i * 0.15,
                    duration: 0.5,
                    ease: "backOut",
                  }}
                >
                  <Link
                    to={`/submissions/${w.submission_id}`}
                    className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-accent/30 border-b border-border/50 last:border-0 ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <motion.span
                      className="text-3xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: isActive ? (winners.length - 1 - i) * 0.8 + 0.3 : i * 0.15 + 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {podiumEmojis[i]}
                    </motion.span>

                    <motion.img
                      src={w.submissions?.cover_image_url}
                      alt={w.submissions?.title || ""}
                      className="h-14 w-14 rounded-xl object-cover shadow-card"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: isActive ? (winners.length - 1 - i) * 0.8 + 0.2 : i * 0.15 + 0.1,
                        type: "spring",
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${i === 0 ? "font-display text-lg font-bold" : "font-medium"}`}>
                        {w.submissions?.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {w.submissions?.artist_name}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {w.weighted_score && Number(w.weighted_score) > 0 && (
                        <Badge className="bg-primary/10 text-primary font-display text-sm">
                          {Number(w.weighted_score).toFixed(1)}/5
                        </Badge>
                      )}
                      {reward && reward.reward_type === "cash" && reward.amount_cents > 0 && (
                        <Badge className="bg-green-600 text-white">
                          <DollarSign className="mr-0.5 h-3 w-3" />
                          {reward.amount_cents / 100}€
                        </Badge>
                      )}
                      {reward && reward.reward_type === "fallback" && (
                        <Badge variant="outline">
                          <Gift className="mr-0.5 h-3 w-3" />
                          {t("reveal.reward", "Prix")}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main Page ─── */
const LiveReveal = () => {
  const { t } = useTranslation();
  const [winners, setWinners] = useState<Array<Tables<"winners"> & { submissions: { title: string; artist_name: string; cover_image_url: string } | null }>>([]);
  const [rewards, setRewards] = useState<Tables<"rewards">[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [activeWeek, setActiveWeek] = useState<Tables<"weeks"> | null>(null);
  const [loading, setLoading] = useState(true);

  // Reveal state
  const [phase, setPhase] = useState<"idle" | "countdown" | "revealing" | "complete">("idle");
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);

  // Categories that have winners
  const categoriesWithWinners = useMemo(
    () => categories.filter((c) => winners.some((w) => w.category_id === c.id)),
    [categories, winners]
  );

  const getWinnersByCategory = useCallback(
    (catId: string) =>
      winners.filter((w) => w.category_id === catId).sort((a, b) => a.rank - b.rank),
    [winners]
  );

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: cats }, { data: week }] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("weeks").select("*").eq("is_active", true).maybeSingle(),
        ]);
        if (cats) setCategories(cats);
        if (week) {
          setActiveWeek(week);
          const [{ data: w }, { data: r }] = await Promise.all([
            supabase
              .from("winners")
              .select("*, submissions(title, artist_name, cover_image_url)")
              .eq("week_id", week.id)
              .order("rank"),
            supabase.from("rewards").select("*").eq("week_id", week.id),
          ]);
          if (w) setWinners(w);
          if (r) setRewards(r);
        }
      } catch (err) {
        console.error("Error loading reveal data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Realtime updates
  useEffect(() => {
    if (!activeWeek) return;
    const channel = supabase
      .channel("reveal-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "winners", filter: `week_id=eq.${activeWeek.id}` }, async () => {
        const { data: w } = await supabase
          .from("winners")
          .select("*, submissions(title, artist_name, cover_image_url)")
          .eq("week_id", activeWeek.id)
          .order("rank");
        if (w) setWinners(w);
        const { data: r } = await supabase.from("rewards").select("*").eq("week_id", activeWeek.id);
        if (r) setRewards(r);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeWeek?.id]);

  // Progressive reveal
  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealedIndex >= categoriesWithWinners.length - 1) {
      setPhase("complete");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      return;
    }
    const timer = setTimeout(() => {
      setRevealedIndex((i) => i + 1);
      // Mini confetti burst on each reveal
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }, 3500);
    return () => clearTimeout(timer);
  }, [phase, revealedIndex, categoriesWithWinners.length]);

  const startReveal = () => {
    setPhase("countdown");
  };

  const onCountdownComplete = useCallback(() => {
    setPhase("revealing");
    setRevealedIndex(0);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }, []);

  const revealAll = () => {
    setRevealedIndex(categoriesWithWinners.length - 1);
    setPhase("complete");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const isResultsPublished = activeWeek?.results_published_at
    ? new Date(activeWeek.results_published_at) <= new Date()
    : false;

  // Grand winner
  const grandWinner = winners.length > 0
    ? winners.filter((w) => w.rank === 1).sort((a, b) => (b.weighted_score || 0) - (a.weighted_score || 0))[0]
    : null;

  return (
    <Layout>
      <SEOHead
        title={t("reveal.seoTitle", "Reveal en direct — Weekly Music Awards")}
        description={t("reveal.seoDesc", "Assistez au dévoilement en direct des résultats du concours musical hebdomadaire.")}
        url="/reveal"
      />

      <ConfettiExplosion active={showConfetti} />

      {phase === "countdown" && (
        <CountdownOverlay count={3} onComplete={onCountdownComplete} />
      )}

      <div className="container py-6 sm:py-8 px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <motion.div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary"
            animate={phase === "idle" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl">
            <span className="text-gradient">
              {t("reveal.title", "Reveal des résultats")}
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
            {activeWeek?.title || t("reveal.subtitle", "Découvrez les gagnants catégorie par catégorie")}
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {/* No results yet */}
        {!loading && !isResultsPublished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Volume2 className="h-10 w-10 text-primary" />
              </div>
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-primary/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold">
              {t("reveal.notYet", "Le reveal n'a pas encore commencé")}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              {t("reveal.notYetDesc", "Les résultats seront révélés dès que la période de vote sera terminée. Revenez bientôt !")}
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/vote">{t("reveal.goVote", "Voter maintenant")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/results">{t("reveal.seeResults", "Page résultats")}</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Ready to reveal */}
        {!loading && isResultsPublished && categoriesWithWinners.length > 0 && (
          <>
            {/* Controls */}
            {phase === "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center mb-12"
              >
                <motion.button
                  onClick={startReveal}
                  className="group relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ boxShadow: ["0 0 30px -10px hsl(263 70% 62% / 0.4)", "0 0 60px -10px hsl(263 70% 62% / 0.6)", "0 0 30px -10px hsl(263 70% 62% / 0.4)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Play className="h-12 w-12 ml-1" />
                </motion.button>
                <p className="mt-4 font-display text-lg font-semibold">
                  {t("reveal.start", "Lancer le reveal")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {categoriesWithWinners.length} {t("reveal.categoriesToReveal", "catégories à révéler")}
                </p>
              </motion.div>
            )}

            {/* Progress bar */}
            {(phase === "revealing" || phase === "complete") && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {Math.min(revealedIndex + 1, categoriesWithWinners.length)} / {categoriesWithWinners.length}
                  </span>
                  {phase === "revealing" && (
                    <Button variant="ghost" size="sm" onClick={revealAll} className="text-xs">
                      {t("reveal.skipAll", "Tout révéler")}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((revealedIndex + 1) / categoriesWithWinners.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Category cards */}
            {(phase === "revealing" || phase === "complete") && (
              <div className="space-y-6">
                {categoriesWithWinners.map((cat, i) => (
                  <CategoryReveal
                    key={cat.id}
                    category={cat}
                    winners={getWinnersByCategory(cat.id)}
                    rewards={rewards}
                    index={i}
                    isActive={phase === "revealing" && i === revealedIndex}
                    isRevealed={i <= revealedIndex}
                  />
                ))}
              </div>
            )}

            {/* Grand winner */}
            {phase === "complete" && grandWinner && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "backOut" }}
                className="mt-12"
              >
                <Card className="relative overflow-hidden border-2 border-primary/40">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-primary opacity-[0.06]" />
                  {[...Array(12)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-yellow-400/50"
                      style={{ top: `${10 + Math.random() * 80}%`, left: `${5 + Math.random() * 90}%` }}
                      animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3], scale: [0.6, 1.3, 0.6] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                    />
                  ))}

                  <CardContent className="relative py-8 px-6">
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <Crown className="h-12 w-12 text-yellow-500" />
                      </motion.div>
                      <h2 className="mt-3 font-display text-3xl font-black text-gradient">
                        {t("reveal.grandWinner", "Grand Gagnant")}
                      </h2>

                      <Link
                        to={`/submissions/${grandWinner.submission_id}`}
                        className="mt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 rounded-2xl p-4 transition-colors hover:bg-accent/30"
                      >
                        <motion.img
                          src={grandWinner.submissions?.cover_image_url}
                          alt={grandWinner.submissions?.title || ""}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover shadow-glow"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: "spring" }}
                        />
                        <div className="text-center sm:text-left">
                          <p className="font-display text-xl sm:text-2xl font-bold">
                            {grandWinner.submissions?.title}
                          </p>
                          <p className="text-base sm:text-lg text-muted-foreground">
                            {grandWinner.submissions?.artist_name}
                          </p>
                          <div className="mt-2 flex gap-2">
                            {grandWinner.weighted_score && Number(grandWinner.weighted_score) > 0 && (
                              <Badge className="bg-primary/10 text-primary font-display text-base px-3">
                                {Number(grandWinner.weighted_score).toFixed(1)}/5
                              </Badge>
                            )}
                            <Badge className="bg-primary text-primary-foreground font-display text-base px-3">
                              {grandWinner.vote_count} {grandWinner.vote_count !== 1 ? "votes" : "vote"}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Final CTA */}
            {phase === "complete" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 flex flex-col items-center text-center gap-4"
              >
                <p className="text-muted-foreground">
                  {t("reveal.allRevealed", "Tous les résultats ont été révélés !")}
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link to="/results">
                      {t("reveal.fullResults", "Résultats complets")}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/hall-of-fame">
                      {t("reveal.hallOfFame", "Hall of Fame")}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default LiveReveal;
