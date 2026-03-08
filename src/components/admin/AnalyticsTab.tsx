import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, UserPlus, Vote, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { format, subDays } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { de } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

type Period = 7 | 30 | 90;

interface DailyCount {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  views: number;
}

const DATE_LOCALES: Record<string, typeof frLocale> = { fr: frLocale, en: enUS, de };

export function AnalyticsTab() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(30);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [signupsPerDay, setSignupsPerDay] = useState<DailyCount[]>([]);
  const [votesPerDay, setVotesPerDay] = useState<DailyCount[]>([]);
  const [pageViewsPerDay, setPageViewsPerDay] = useState<DailyCount[]>([]);
  const [totals, setTotals] = useState({ views: 0, signups: 0, votes: 0 });
  const [prevTotals, setPrevTotals] = useState({ views: 0, signups: 0, votes: 0 });

  const dateLocale = DATE_LOCALES[i18n.language] || frLocale;

  useEffect(() => {
    loadAnalytics();
  }, [period, i18n.language]);

  const loadAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    const since = subDays(now, period).toISOString();
    const prevSince = subDays(now, period * 2).toISOString();

    try {
      const { data: allEvents } = await supabase
        .from("analytics_events")
        .select("event_name, properties, created_at")
        .gte("created_at", prevSince)
        .order("created_at", { ascending: true });

      if (!allEvents) { setLoading(false); return; }

      const events = allEvents.filter((e) => e.created_at >= since);
      const prevEvents = allEvents.filter((e) => e.created_at < since);

      const pageViews = events.filter((e) => e.event_name === "page_view");
      const pageCounts: Record<string, number> = {};
      pageViews.forEach((e) => {
        const path = (e.properties as Record<string, unknown>)?.path as string || "/";
        pageCounts[path] = (pageCounts[path] || 0) + 1;
      });
      const sortedPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      setTopPages(sortedPages);

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
          date: format(new Date(date), "dd MMM", { locale: dateLocale }),
          count,
        }));
      };

      const signups = events.filter((e) => e.event_name === "signup_completed");
      const votes = events.filter((e) => e.event_name === "vote_cast");

      setPageViewsPerDay(groupByDay(pageViews));
      setSignupsPerDay(groupByDay(signups));
      setVotesPerDay(groupByDay(votes));
      setTotals({ views: pageViews.length, signups: signups.length, votes: votes.length });

      const prevPageViews = prevEvents.filter((e) => e.event_name === "page_view");
      const prevSignups = prevEvents.filter((e) => e.event_name === "signup_completed");
      const prevVotes = prevEvents.filter((e) => e.event_name === "vote_cast");
      setPrevTotals({ views: prevPageViews.length, signups: prevSignups.length, votes: prevVotes.length });
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

  const exportCSV = () => {
    const rows: string[][] = [[t("analytics.pageViews"), t("analytics.signups"), t("analytics.trackedVotes")]];
    pageViewsPerDay.forEach((pv, i) => {
      rows.push([pv.date, String(pv.count), String(signupsPerDay[i]?.count ?? 0), String(votesPerDay[i]?.count ?? 0)]);
    });
    rows.push([]);
    rows.push([t("analytics.topPages"), t("analytics.views")]);
    topPages.forEach((p) => { rows.push([p.path, String(p.views)]); });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${period}d.csv`; a.click();
    URL.revokeObjectURL(url);
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
        <h2 className="font-display text-xl font-semibold">{t("analytics.title", { period })}</h2>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={String(period)}
            onValueChange={(v) => v && setPeriod(Number(v) as Period)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="7">{t("analytics.days7")}</ToggleGroupItem>
            <ToggleGroupItem value="30">{t("analytics.days30")}</ToggleGroupItem>
            <ToggleGroupItem value="90">{t("analytics.days90")}</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Eye className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.views}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.pageViews")}</p>
            <TrendBadge current={totals.views} previous={prevTotals.views} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <UserPlus className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.signups}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.signups")}</p>
            <TrendBadge current={totals.signups} previous={prevTotals.signups} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Vote className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold font-display">{totals.votes}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.trackedVotes")}</p>
            <TrendBadge current={totals.votes} previous={prevTotals.votes} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> {t("analytics.pageViewsPerDay")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pageViewsPerDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name={t("analytics.views")} className="stroke-primary" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" /> {t("analytics.signupsPerDay")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={signupsPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name={t("analytics.signups")} className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Vote className="h-4 w-4" /> {t("analytics.votesPerDay")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={votesPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name={t("analytics.trackedVotes")} className="fill-accent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.topPages")}</CardTitle>
        </CardHeader>
        <CardContent>
          {topPages.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("analytics.noData")}</p>
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
