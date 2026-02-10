import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { RewardPoolBanner } from "@/components/rewards/RewardPoolBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Crown, Medal, DollarSign, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const Results = () => {
  const [winners, setWinners] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [activeWeek, setActiveWeek] = useState<Tables<"weeks"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: week }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("weeks").select("*").eq("is_active", true).single(),
      ]);

      if (cats) setCategories(cats);
      if (week) {
        setActiveWeek(week);

        // Load winners with submission details
        const { data: w } = await supabase
          .from("winners")
          .select("*, submissions(title, artist_name, cover_image_url)")
          .eq("week_id", week.id)
          .order("rank");

        if (w) setWinners(w);

        // Load rewards for these winners
        const { data: r } = await supabase
          .from("rewards")
          .select("*")
          .eq("week_id", week.id);

        if (r) setRewards(r);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Realtime: listen for new winners being published
  useEffect(() => {
    if (!activeWeek) return;

    const channel = supabase
      .channel("results-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "winners",
          filter: `week_id=eq.${activeWeek.id}`,
        },
        async () => {
          // Reload winners when changes occur
          const { data: w } = await supabase
            .from("winners")
            .select("*, submissions(title, artist_name, cover_image_url)")
            .eq("week_id", activeWeek.id)
            .order("rank");
          if (w) setWinners(w);

          const { data: r } = await supabase
            .from("rewards")
            .select("*")
            .eq("week_id", activeWeek.id);
          if (r) setRewards(r);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "weeks",
          filter: `id=eq.${activeWeek.id}`,
        },
        (payload) => {
          setActiveWeek(payload.new as Tables<"weeks">);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWeek?.id]);

  const isResultsPublished = activeWeek?.results_published_at
    ? new Date(activeWeek.results_published_at) <= new Date()
    : false;

  const getWinnersByCategory = (catId: string) =>
    winners.filter((w) => w.category_id === catId).sort((a: any, b: any) => a.rank - b.rank);

  const getRewardForWinner = (winnerId: string) =>
    rewards.find((r) => r.winner_id === winnerId);

  const podiumLabels = ["🥇", "🥈", "🥉"];

  // Grand winner: rank 1 with highest vote_count across all categories
  const grandWinner = isResultsPublished && winners.length > 0
    ? winners.filter((w) => w.rank === 1).sort((a: any, b: any) => (b.weighted_score || 0) - (a.weighted_score || 0))[0]
    : null;

  return (
    <Layout>
      <SEOHead
        title="Resultats"
        description="Decouvrez les gagnants du concours musical Weekly Music Awards de cette semaine."
        url="/results"
      />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Résultats</h1>
          <p className="mt-2 text-muted-foreground">
            {activeWeek?.title || "Semaine en cours"} — {isResultsPublished ? "Résultats publiés" : "En attente de publication"}
          </p>
          {isResultsPublished && (
            <Link to="/scoring-method" className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Comment sont calculés les scores ?
            </Link>
          )}
        </div>

        <div className="mb-6">
          <RewardPoolBanner />
        </div>

        {!isResultsPublished ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Le podium se prépare…</h2>
            <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
              Soyez parmi les premiers à découvrir le podium ! Les résultats seront publiés à la fin de la période de vote
              {activeWeek?.voting_close_at && (
                <> (clôture le {new Date(activeWeek.voting_close_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })})</>
              )}.
              Une cagnotte attend les gagnants. 🎉
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/explore" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Découvrir les morceaux
              </Link>
              <Link to="/compete" className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                Soumettre un morceau
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {/* Grand Winner */}
            {grandWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
              <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                  {/* Celebration particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-yellow-400/60"
                      style={{ top: `${15 + Math.random() * 30}%`, left: `${5 + Math.random() * 90}%` }}
                      animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                  ))}
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2 text-xl">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      Grand Gagnant de la Semaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/submissions/${grandWinner.submission_id}`} className="flex items-center gap-4 rounded-xl p-1 -m-1 transition-colors hover:bg-accent/30">
                      <img
                        src={grandWinner.submissions?.cover_image_url}
                        alt=""
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xl font-bold truncate">{grandWinner.submissions?.title}</p>
                        <p className="text-muted-foreground">{grandWinner.submissions?.artist_name}</p>
                        {(() => {
                          const reward = getRewardForWinner(grandWinner.id);
                          if (!reward) return null;
                          return reward.reward_type === "cash" ? (
                            <Badge className="mt-1 bg-green-600 text-white">
                              <DollarSign className="mr-1 h-3 w-3" /> {reward.amount_cents / 100}€
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-1">
                              <Gift className="mr-1 h-3 w-3" /> {reward.label}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {grandWinner.weighted_score > 0 && (
                          <Badge className="bg-primary/10 text-primary font-display text-sm">
                            {Number(grandWinner.weighted_score).toFixed(1)}/5
                          </Badge>
                        )}
                        <Badge className="bg-primary text-primary-foreground font-display text-lg px-4 py-1">
                          {grandWinner.vote_count} votes
                        </Badge>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Per-category results */}
            {categories.map((cat, catIndex) => {
              const catWinners = getWinnersByCategory(cat.id);
              if (catWinners.length === 0) return null;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {cat.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {catWinners.map((w: any, i: number) => {
                          const reward = getRewardForWinner(w.id);
                          return (
                            <Link key={w.id} to={`/submissions/${w.submission_id}`}>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: catIndex * 0.1 + i * 0.15 }}
                              className={`flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-accent/30 ${
                                i === 0
                                  ? "bg-primary/10 border border-primary/20"
                                  : "bg-secondary/50"
                              }`}
                            >
                              <span className="text-2xl">{podiumLabels[i]}</span>
                              <img src={w.submissions?.cover_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{w.submissions?.title}</p>
                                <p className="text-sm text-muted-foreground">{w.submissions?.artist_name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {reward && reward.reward_type === "cash" && reward.amount_cents > 0 && (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    {reward.amount_cents / 100}€
                                  </Badge>
                                )}
                                {reward && reward.reward_type === "fallback" && (
                                  <Badge variant="outline" className="text-xs">
                                    <Gift className="mr-1 h-3 w-3" /> Récompense
                                  </Badge>
                                )}
                                {w.weighted_score > 0 && (
                                  <Badge className="bg-primary/10 text-primary text-xs font-display">
                                    {Number(w.weighted_score).toFixed(1)}/5
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="font-display">
                                  {w.vote_count} votes
                                </Badge>
                              </div>
                            </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Link to Hall of Fame */}
            <div className="mt-10 flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground">Envie de revoir les palmarès précédents ?</p>
              <Link to="/hall-of-fame" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Voir le Hall of Fame →
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
};

export default Results;
