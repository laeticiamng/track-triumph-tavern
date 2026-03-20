import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, BarChart3, CircleDollarSign, Disc3, HeartHandshake, RadioTower, Sparkles, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

type WeeklySeriesPoint = {
  label: string;
  votes: number;
  submissions: number;
};

type CategorySeriesPoint = {
  name: string;
  submissions: number;
  votes: number;
};

type ImpactMetrics = {
  artists: number;
  submissions: number;
  votes: number;
  rewardPoolEuros: number;
  follows: number;
  badges: number;
  weeklySeries: WeeklySeriesPoint[];
  categorySeries: CategorySeriesPoint[];
};

const INITIAL_METRICS: ImpactMetrics = {
  artists: 0,
  submissions: 0,
  votes: 0,
  rewardPoolEuros: 0,
  follows: 0,
  badges: 0,
  weeklySeries: [],
  categorySeries: [],
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

const ImpactDashboard = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ImpactMetrics>(INITIAL_METRICS);

  useEffect(() => {
    let cancelled = false;

    async function loadImpact() {
      setLoading(true);
      try {
        const [
          { data: categories },
          { data: weeks },
          { data: submissions },
          { data: votes },
          { data: follows },
          { data: badges },
          { data: rewardPools },
        ] = await Promise.all([
          supabase.from("categories").select("id, name"),
          supabase.from("weeks").select("id, week_number").order("week_number", { ascending: false }).limit(6),
          supabase.from("submissions").select("id, user_id, week_id, category_id").eq("status", "approved"),
          supabase.from("votes").select("id, week_id, category_id").eq("is_valid", true),
          supabase.from("follows").select("id"),
          supabase.from("weekly_badges").select("id"),
          supabase.from("reward_pools").select("current_cents"),
        ]);

        const artistCount = new Set((submissions ?? []).map((submission) => submission.user_id)).size;
        const weekMap = new Map((weeks ?? []).map((week) => [week.id, week.week_number]));
        const orderedWeeks = [...(weeks ?? [])].sort((a, b) => a.week_number - b.week_number);
        const categoryNameMap = new Map((categories ?? []).map((category) => [category.id, category.name]));

        const votesByWeek = new Map<string, number>();
        const submissionsByWeek = new Map<string, number>();
        const categoryBuckets = new Map<string, { submissions: number; votes: number }>();

        for (const submission of submissions ?? []) {
          submissionsByWeek.set(submission.week_id, (submissionsByWeek.get(submission.week_id) ?? 0) + 1);
          const current = categoryBuckets.get(submission.category_id) ?? { submissions: 0, votes: 0 };
          current.submissions += 1;
          categoryBuckets.set(submission.category_id, current);
        }

        for (const vote of votes ?? []) {
          votesByWeek.set(vote.week_id, (votesByWeek.get(vote.week_id) ?? 0) + 1);
          const current = categoryBuckets.get(vote.category_id) ?? { submissions: 0, votes: 0 };
          current.votes += 1;
          categoryBuckets.set(vote.category_id, current);
        }

        const weeklySeries = orderedWeeks.map((week) => ({
          label: `S${week.week_number}`,
          votes: votesByWeek.get(week.id) ?? 0,
          submissions: submissionsByWeek.get(week.id) ?? 0,
        }));

        const categorySeries = [...categoryBuckets.entries()]
          .map(([categoryId, values]) => ({
            name: categoryNameMap.get(categoryId) ?? "Catégorie",
            submissions: values.submissions,
            votes: values.votes,
          }))
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 6);

        if (!cancelled) {
          setMetrics({
            artists: artistCount,
            submissions: submissions?.length ?? 0,
            votes: votes?.length ?? 0,
            rewardPoolEuros: (rewardPools ?? []).reduce((total, pool) => total + pool.current_cents, 0) / 100,
            follows: follows?.length ?? 0,
            badges: badges?.length ?? 0,
            weeklySeries,
            categorySeries,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadImpact();

    return () => {
      cancelled = true;
    };
  }, []);

  const fade = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };
  const summaryCards = useMemo(
    () => [
      { label: "Artistes engagés", value: metrics.artists, icon: Users, tint: "from-fuchsia-500/25 to-transparent" },
      { label: "Soumissions approuvées", value: metrics.submissions, icon: Disc3, tint: "from-cyan-500/25 to-transparent" },
      { label: "Votes valides", value: metrics.votes, icon: Activity, tint: "from-emerald-500/25 to-transparent" },
      { label: "Reward pool cumulé", value: `${numberFormatter.format(metrics.rewardPoolEuros)} €`, icon: CircleDollarSign, tint: "from-amber-500/25 to-transparent" },
    ],
    [metrics.artists, metrics.rewardPoolEuros, metrics.submissions, metrics.votes],
  );

  return (
    <Layout>
      <SEOHead
        title={t("impact.seo.title")}
        description={t("impact.seo.description")}
        url="/impact"
      />

      <section className="py-12 sm:py-20 md:py-28">
        <div className="container max-w-6xl px-4 sm:px-6">
          <motion.div {...fade} className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("impact.badge")}
            </span>
            <h1 className="font-display text-2xl font-bold sm:text-4xl md:text-5xl">
              {t("impact.titlePrefix")} <span className="text-primary">{t("impact.titleHighlight")}</span> {t("impact.titleSuffix")}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              Ce tableau a été recâblé uniquement sur les données réelles de la plateforme : votes valides, soumissions approuvées,
              semaines publiées, badges, follows et reward pools.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-[1.75rem]" />)
              : summaryCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div key={card.label} {...fade} transition={shouldReduceMotion ? undefined : { delay: index * 0.06 }}>
                      <Card className="relative overflow-hidden rounded-[1.75rem] border-white/10 bg-slate-950 text-white shadow-[0_20px_70px_rgba(15,23,42,0.35)]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.tint}`} />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        <CardContent className="relative p-6">
                          <div className="mb-8 flex items-center justify-between">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                              <Icon className="h-5 w-5 text-cyan-100" />
                            </div>
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Live data</div>
                          </div>
                          <p className="text-4xl font-bold tracking-tight">{card.value}</p>
                          <p className="mt-3 text-sm text-slate-300">{card.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div {...fade} transition={shouldReduceMotion ? undefined : { delay: 0.18 }}>
              <Card className="rounded-[1.75rem] border border-border/60 bg-card/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <RadioTower className="h-4 w-4 text-primary" />
                    Traction par semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[320px] rounded-2xl" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={metrics.weeklySeries} margin={{ left: 8, right: 8, top: 10 }}>
                        <defs>
                          <linearGradient id="votesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="votes" stroke="hsl(var(--primary))" fill="url(#votesFill)" strokeWidth={3} />
                        <Area type="monotone" dataKey="submissions" stroke="hsl(var(--chart-2))" fill="transparent" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fade} transition={shouldReduceMotion ? undefined : { delay: 0.24 }}>
              <Card className="rounded-[1.75rem] border border-border/60 bg-card/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Catégories les plus sollicitées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[320px] rounded-2xl" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={metrics.categorySeries} margin={{ left: 8, right: 8, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="submissions" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div {...fade} transition={shouldReduceMotion ? undefined : { delay: 0.3 }} className="mt-8 grid gap-4 md:grid-cols-3">
            <InsightCard icon={HeartHandshake} title="Follows actifs" value={metrics.follows} copy="Le graphe social mesure les connexions créateurs ↔ auditeurs déjà enregistrées dans la base." />
            <InsightCard icon={Trophy} title="Badges attribués" value={metrics.badges} copy="La gamification ne repose plus sur des estimations : seuls les badges réellement calculés sont affichés." />
            <InsightCard icon={Sparkles} title="Aucune donnée mockée" value="100% réel" copy="Tous les blocs de cette page s'appuient désormais sur Supabase et s'ajustent automatiquement à l'activité." />
          </motion.div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

function InsightCard({ icon: Icon, title, value, copy }: { icon: typeof Sparkles; title: string; value: number | string; copy: string }) {
  return (
    <Card className="rounded-[1.5rem] border border-border/60 bg-card/70 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <p className="mt-2 font-display text-3xl font-bold">{typeof value === "number" ? numberFormatter.format(value) : value}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
      </CardContent>
    </Card>
  );
}

export default ImpactDashboard;
