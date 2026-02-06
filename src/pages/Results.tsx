import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { RewardPoolBanner } from "@/components/rewards/RewardPoolBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;

const Results = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
        const { data: subs } = await supabase
          .from("submissions")
          .select("*")
          .eq("week_id", week.id)
          .eq("status", "approved")
          .order("vote_count", { ascending: false });
        if (subs) setSubmissions(subs);
      }
      setLoading(false);
    };
    load();
  }, []);

  const isResultsPublished = activeWeek?.results_published_at
    ? new Date(activeWeek.results_published_at) <= new Date()
    : false;

  const getTopByCategory = (catId: string) =>
    submissions.filter((s) => s.category_id === catId).slice(0, 3);

  const podiumIcons = [
    <Crown className="h-5 w-5 text-yellow-500" />,
    <Medal className="h-5 w-5 text-muted-foreground" />,
    <Medal className="h-5 w-5 text-amber-700" />,
  ];
  const podiumLabels = ["🥇", "🥈", "🥉"];

  // Grand winner across all categories
  const grandWinner = isResultsPublished && submissions.length > 0 ? submissions[0] : null;

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
                        src={grandWinner.cover_image_url}
                        alt=""
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xl font-bold truncate">{grandWinner.title}</p>
                        <p className="text-muted-foreground">{grandWinner.artist_name}</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground font-display text-lg px-4 py-1">
                        {grandWinner.vote_count} votes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Per-category results */}
            {categories.map((cat, catIndex) => {
              const top = getTopByCategory(cat.id);
              if (top.length === 0) return null;

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
                        {top.map((sub, i) => (
                          <motion.div
                            key={sub.id}
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
                            <img src={sub.cover_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{sub.title}</p>
                              <p className="text-sm text-muted-foreground">{sub.artist_name}</p>
                            </div>
                            <Badge variant="secondary" className="font-display">
                              {sub.vote_count} votes
                            </Badge>
                          </motion.div>
                        ))}
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
