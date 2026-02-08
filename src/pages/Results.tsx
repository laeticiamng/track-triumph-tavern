import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { RewardPoolBanner } from "@/components/rewards/RewardPoolBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Crown, Medal, DollarSign, Gift } from "lucide-react";
import { motion } from "framer-motion";
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
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Résultats</h1>
          <p className="mt-2 text-muted-foreground">
            {activeWeek?.title || "Semaine en cours"} — {isResultsPublished ? "Résultats publiés" : "En attente de publication"}
          </p>
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
            <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-2xl font-bold">Résultats à venir</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Les résultats seront publiés à la fin de la période de vote. Revenez bientôt pour découvrir le podium !
            </p>
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
                <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2 text-xl">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      Grand Gagnant de la Semaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
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
                    </div>
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
                            <motion.div
                              key={w.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: catIndex * 0.1 + i * 0.15 }}
                              className={`flex items-center gap-4 rounded-xl p-3 ${
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
                                    <Gift className="mr-1 h-3 w-3" /> Reward
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
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
};

export default Results;
