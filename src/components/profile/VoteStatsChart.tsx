import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubscriptionTier } from "@/lib/subscription-tiers";

interface VoteStatsChartProps {
  userId: string;
  tier: SubscriptionTier;
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(262 80% 60%)",
  "hsl(340 75% 55%)",
  "hsl(180 60% 45%)",
  "hsl(45 90% 55%)",
];

export function VoteStatsChart({ userId, tier }: VoteStatsChartProps) {
  const [dailyData, setDailyData] = useState<{ date: string; votes: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      // Get user's submissions
      const { data: subs } = await supabase
        .from("submissions")
        .select("id, category_id")
        .eq("user_id", userId);

      if (!subs || subs.length === 0) {
        setLoading(false);
        return;
      }

      const subIds = subs.map((s) => s.id);

      // Get votes received on those submissions in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: votes } = await supabase
        .from("votes")
        .select("created_at, submission_id")
        .in("submission_id", subIds)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at");

      if (!votes) {
        setLoading(false);
        return;
      }

      // Group by day
      const dayMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
        dayMap.set(key, 0);
      }

      for (const v of votes) {
        const d = new Date(v.created_at);
        const key = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
        dayMap.set(key, (dayMap.get(key) || 0) + 1);
      }

      setDailyData(Array.from(dayMap.entries()).map(([date, votes]) => ({ date, votes })));

      // Category breakdown (Elite only)
      if (tier === "elite") {
        const catMap = new Map<string, number>();
        const subCatMap = new Map(subs.map((s) => [s.id, s.category_id]));

        // Get category names
        const { data: cats } = await supabase.from("categories").select("id, name");
        const catNameMap = new Map(cats?.map((c) => [c.id, c.name]) ?? []);

        for (const v of votes) {
          const catId = subCatMap.get(v.submission_id);
          if (catId) {
            const catName = catNameMap.get(catId) || "Autre";
            catMap.set(catName, (catMap.get(catName) || 0) + 1);
          }
        }

        setCategoryData(Array.from(catMap.entries()).map(([name, value]) => ({ name, value })));
      }

      setLoading(false);
    }

    fetchStats();
  }, [userId, tier]);

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (dailyData.length === 0 || dailyData.every((d) => d.votes === 0)) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Pas encore de votes reçus ces 7 derniers jours. Soumettez un morceau pour commencer !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily votes chart */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Votes reçus (7 derniers jours)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="votes"
                stroke="hsl(var(--primary))"
                fill="url(#voteGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown (Elite only) */}
        {tier === "elite" && categoryData.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Répartition par catégorie</p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
