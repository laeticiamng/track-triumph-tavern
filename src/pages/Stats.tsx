import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, Heart, TrendingUp, Trophy, Music,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface WeekStats {
  totalVotes: number;
  totalParticipants: number;
  totalSubmissions: number;
  categoriesData: { name: string; votes: number }[];
  topTracks: {
    id: string;
    title: string;
    artist_name: string;
    cover_image_url: string;
    vote_count: number;
    category_name: string;
  }[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.3)",
];

const Stats = () => {
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [weekTitle, setWeekTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Get active week
        const { data: week } = await supabase
          .from("weeks")
          .select("id, title")
          .eq("is_active", true)
          .single();

        if (!week) {
          return;
        }

        setWeekTitle(week.title || "Semaine en cours");

        // Fetch all data in parallel
        const [
          { count: totalVotes },
          { data: submissions },
          { data: categories },
          { data: voters },
        ] = await Promise.all([
          supabase
            .from("votes")
            .select("id", { count: "exact", head: true })
            .eq("week_id", week.id)
            .eq("is_valid", true),
          supabase
            .from("submissions")
            .select("id, title, artist_name, cover_image_url, vote_count, category_id")
            .eq("week_id", week.id)
            .eq("status", "approved")
            .order("vote_count", { ascending: false }),
          supabase.from("categories").select("id, name").order("sort_order"),
          supabase
            .from("votes")
            .select("user_id")
            .eq("week_id", week.id)
            .eq("is_valid", true),
        ]);

        const catMap = new Map(categories?.map((c) => [c.id, c.name]) ?? []);

        // Count distinct voters
        const uniqueVoters = new Set(voters?.map((v) => v.user_id) ?? []);

        // Votes per category
        const catVoteCounts = new Map<string, number>();
        submissions?.forEach((s) => {
          const current = catVoteCounts.get(s.category_id) || 0;
          catVoteCounts.set(s.category_id, current + s.vote_count);
        });

        const categoriesData = (categories ?? [])
          .map((c) => ({
            name: c.name,
            votes: catVoteCounts.get(c.id) || 0,
          }))
          .sort((a, b) => b.votes - a.votes);

        // Top 3 tracks
        const topTracks = (submissions ?? []).slice(0, 3).map((s) => ({
          ...s,
          category_name: catMap.get(s.category_id) || "",
        }));

        setStats({
          totalVotes: totalVotes || 0,
          totalParticipants: uniqueVoters.size,
          totalSubmissions: submissions?.length || 0,
          categoriesData,
          topTracks,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const podiumEmojis = ["1", "2", "3"];

  return (
    <Layout>
      <SEOHead
        title="Statistiques"
        description="Découvrez les statistiques en temps réel du concours musical Weekly Music Awards."
        url="/stats"
      />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Statistiques</h1>
          <p className="mt-2 text-muted-foreground">{weekTitle} — Données en temps réel</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="py-6 text-center">
                  <div className="h-8 w-16 mx-auto rounded bg-muted animate-pulse mb-2" />
                  <div className="h-4 w-24 mx-auto rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !stats ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl font-semibold">Pas de données disponibles</h2>
            <p className="mt-2 text-muted-foreground">
              Les statistiques seront disponibles dès le début de la prochaine compétition.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card>
                  <CardContent className="py-6 text-center">
                    <Heart className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="font-display text-3xl font-bold">{stats.totalVotes}</p>
                    <p className="text-xs text-muted-foreground">Votes cette semaine</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="py-6 text-center">
                    <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="font-display text-3xl font-bold">{stats.totalParticipants}</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="py-6 text-center">
                    <Music className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="font-display text-3xl font-bold">{stats.totalSubmissions}</p>
                    <p className="text-xs text-muted-foreground">Morceaux en compétition</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="py-6 text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="font-display text-3xl font-bold">
                      {stats.categoriesData.length > 0 ? stats.categoriesData[0].name : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Catégorie la plus votée</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Top 3 du moment */}
            {stats.topTracks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Top 3 du moment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topTracks.map((track, i) => (
                        <Link
                          key={track.id}
                          to={`/submissions/${track.id}`}
                          className={`flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-accent/30 ${
                            i === 0
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-secondary/50"
                          }`}
                        >
                          <span className="font-display text-2xl font-bold text-muted-foreground w-8 text-center">
                            {podiumEmojis[i]}
                          </span>
                          <img
                            src={track.cover_image_url}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {track.category_name}
                            </Badge>
                            <Badge className="bg-primary/10 text-primary font-display">
                              {track.vote_count} votes
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Votes by Category Chart */}
            {stats.categoriesData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Votes par catégorie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoriesData} layout="vertical" margin={{ left: 100 }}>
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            width={90}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                            {stats.categoriesData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
};

export default Stats;
