import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, musicGroupJsonLd } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart3, Trophy, Music, Heart, ArrowLeft, TrendingUp, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface ArtistData {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  submissions: {
    id: string;
    title: string;
    cover_image_url: string;
    vote_count: number;
    status: string;
    week_title: string;
    week_number: number;
    category_name: string;
  }[];
  weeklyProgress: { week: string; votes: number }[];
  totalVotesReceived: number;
  bestRank: number | null;
  totalSubmissions: number;
}

const ArtistStats = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        // Get profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, bio")
          .eq("id", id)
          .single();

        if (!profile) {
          return;
        }

        // Get submissions with week & category info
        const { data: submissions } = await supabase
          .from("submissions")
          .select("id, title, cover_image_url, vote_count, status, week_id, category_id")
          .eq("user_id", id)
          .order("created_at", { ascending: false });

        // Get weeks and categories for lookup
        const [{ data: weeks }, { data: categories }, { data: wins }] = await Promise.all([
          supabase.from("weeks").select("id, title, week_number").order("week_number"),
          supabase.from("categories").select("id, name"),
          supabase.from("winners").select("rank").eq("user_id", id).order("rank", { ascending: true }).limit(1),
        ]);

        const weekMap = new Map(weeks?.map((w) => [w.id, w]) ?? []);
        const catMap = new Map(categories?.map((c) => [c.id, c.name]) ?? []);

        const enrichedSubmissions = (submissions ?? []).map((s) => {
          const week = weekMap.get(s.week_id);
          return {
            ...s,
            week_title: week?.title || `Semaine ${week?.week_number || "?"}`,
            week_number: week?.week_number || 0,
            category_name: catMap.get(s.category_id) || "",
          };
        });

        const totalVotesReceived = enrichedSubmissions.reduce((sum, s) => sum + s.vote_count, 0);

        // Build weekly progress
        const weeklyMap = new Map<number, number>();
        enrichedSubmissions.forEach((s) => {
          if (s.week_number > 0) {
            const current = weeklyMap.get(s.week_number) || 0;
            weeklyMap.set(s.week_number, current + s.vote_count);
          }
        });

        const weeklyProgress = Array.from(weeklyMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([wk, votes]) => ({ week: `S${wk}`, votes }));

        setData({
          displayName: profile.display_name || "Artiste",
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          submissions: enrichedSubmissions,
          weeklyProgress,
          totalVotesReceived,
          bestRank: wins && wins.length > 0 ? wins[0].rank : null,
          totalSubmissions: enrichedSubmissions.length,
        });
      } catch (err) {
        console.error("Error loading artist stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!data) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Artiste introuvable.</p>
          <Link to="/explore" className="mt-4 inline-flex text-sm text-primary hover:underline">
            Retour
          </Link>
        </div>
        <Footer />
      </Layout>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <Layout>
      <SEOHead
        title={`Stats de ${data.displayName}`}
        description={`Statistiques et historique de ${data.displayName} sur Weekly Music Awards.`}
        url={`/stats/artist/${id}`}
        jsonLd={musicGroupJsonLd({
          name: data.displayName,
          id: id!,
          image: data.avatarUrl || undefined,
        })}
      />
      <div className="container max-w-2xl py-8">
        <Link
          to={`/artist/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au profil
        </Link>

        {/* Artist Header */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={data.avatarUrl || undefined} />
            <AvatarFallback className="text-lg font-bold">{data.displayName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold">{data.displayName}</h1>
            <p className="text-sm text-muted-foreground">Statistiques détaillées</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <Music className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="font-display text-2xl font-bold">{data.totalSubmissions}</p>
            <p className="text-xs text-muted-foreground">Soumissions</p>
          </Card>
          <Card className="text-center p-4">
            <Heart className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="font-display text-2xl font-bold">{data.totalVotesReceived}</p>
            <p className="text-xs text-muted-foreground">Votes reçus</p>
          </Card>
          <Card className="text-center p-4">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="font-display text-2xl font-bold">
              {data.bestRank ? `#${data.bestRank}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Meilleur classement</p>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        {data.weeklyProgress.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progression semaine par semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.weeklyProgress}>
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="votes"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Submission History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Historique des soumissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.submissions.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">Aucune soumission.</p>
            ) : (
              <div className="space-y-3">
                {data.submissions.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/submissions/${sub.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <img
                      src={sub.cover_image_url}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.week_title} · {sub.category_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColor[sub.status]}>
                        {sub.status === "pending"
                          ? "En attente"
                          : sub.status === "approved"
                          ? "Approuvé"
                          : "Rejeté"}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary font-display text-xs">
                        {sub.vote_count} votes
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
};

export default ArtistStats;
