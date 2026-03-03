import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, UserPlus, Vote, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Period = 7 | 30 | 90;

interface DailyCount {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  views: number;
}

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(30);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [signupsPerDay, setSignupsPerDay] = useState<DailyCount[]>([]);
  const [votesPerDay, setVotesPerDay] = useState<DailyCount[]>([]);
  const [pageViewsPerDay, setPageViewsPerDay] = useState<DailyCount[]>([]);
  const [totals, setTotals] = useState({ views: 0, signups: 0, votes: 0 });
  const [prevTotals, setPrevTotals] = useState({ views: 0, signups: 0, votes: 0 });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    const since = subDays(now, period).toISOString();
    const prevSince = subDays(now, period * 2).toISOString();

    try {
      // Fetch current + previous period in one query
      const { data: allEvents } = await supabase
        .from("analytics_events")
        .select("event_name, properties, created_at")
        .gte("created_at", prevSince)
        .order("created_at", { ascending: true });

      if (!allEvents) { setLoading(false); return; }

      const events = allEvents.filter((e) => e.created_at >= since);
      const prevEvents = allEvents.filter((e) => e.created_at < since);

      // Top pages (current period only)
      const pageViews = events.filter((e) => e.event_name === "page_view");
      const pageCounts: Record<string, number> = {};
      pageViews.forEach((e) => {
        const path = (e.properties as any)?.path || "/";
        pageCounts[path] = (pageCounts[path] || 0) + 1;
      });
      const sortedPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      setTopPages(sortedPages);

      // Group by day helper
      const groupByDay = (items: typeof events): DailyCount[] => {
        const counts: Record<string, number> = {};
        for (let i = period - 1; i >= 0; i--) {
          const d = format(subDays(now, i), "yyyy-MM-dd");
          counts[d] = 0;
        }
        items.forEach((e) => {
          const d = e.created_at.slice(0, 10);
          if (counts[d] !== undefined) counts[d]++;
        });
        return Object.entries(counts).map(([date, count]) => ({
          date: format(new Date(date), "dd MMM", { locale: fr }),
          count,
        }));
      };

      const signups = events.filter((e) => e.event_name === "signup_completed");
      const votes = events.filter((e) => e.event_name === "vote_cast");

      setPageViewsPerDay(groupByDay(pageViews));
      setSignupsPerDay(groupByDay(signups));
      setVotesPerDay(groupByDay(votes));
      setTotals({
        views: pageViews.length,
        signups: signups.length,
        votes: votes.length,
      });

      // Previous period totals
      const prevPageViews = prevEvents.filter((e) => e.event_name === "page_view");
      const prevSignups = prevEvents.filter((e) => e.event_name === "signup_completed");
      const prevVotes = prevEvents.filter((e) => e.event_name === "vote_cast");
      setPrevTotals({
        views: prevPageViews.length,
        signups: prevSignups.length,
        votes: prevVotes.length,
      });
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? { pct: 100, direction: "up" as const } : { pct: 0, direction: "flat" as const };
    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct > 0) return { pct, direction: "up" as const };
    if (pct < 0) return { pct: Math.abs(pct), direction: "down" as const };
    return { pct: 0, direction: "flat" as const };
  };

  const TrendBadge = ({ current, previous }: { current: number; previous: number }) => {
    const { pct, direction } = getTrend(current, previous);
    if (direction === "flat") {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground mt-1">
          <Minus className="h-3 w-3" /> 0%
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium mt-1 ${
        direction === "up" ? "text-emerald-500" : "text-red-500"
      }`}>
        {direction === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {direction === "up" ? "+" : "-"}{pct}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Analytics ({period} derniers jours)</h2>
        <ToggleGroup
          type="single"
          value={String(period)}
          onValueChange={(v) => v && setPeriod(Number(v) as Period)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="7">7j</ToggleGroupItem>
          <ToggleGroupItem value="30">30j</ToggleGroupItem>
          <ToggleGroupItem value="90">90j</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Eye className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.views}</p>
            <p className="text-xs text-muted-foreground">Pages vues</p>
            <TrendBadge current={totals.views} previous={prevTotals.views} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <UserPlus className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.signups}</p>
            <p className="text-xs text-muted-foreground">Inscriptions</p>
            <TrendBadge current={totals.signups} previous={prevTotals.signups} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Vote className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.votes}</p>
            <p className="text-xs text-muted-foreground">Votes trackés</p>
            <TrendBadge current={totals.votes} previous={prevTotals.votes} />
          </CardContent>
        </Card>
      </div>

      {/* Page views per day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Pages vues / jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pageViewsPerDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Vues" className="stroke-primary" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Signups & votes per day */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" /> Inscriptions / jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={signupsPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Inscriptions" className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Vote className="h-4 w-4" /> Votes / jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={votesPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Votes" className="fill-accent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top pages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top pages</CardTitle>
        </CardHeader>
        <CardContent>
          {topPages.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune donnée encore.</p>
          ) : (
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={p.path} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm font-medium truncate max-w-[240px]">{p.path}</span>
                  </div>
                  <span className="text-sm font-semibold">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
