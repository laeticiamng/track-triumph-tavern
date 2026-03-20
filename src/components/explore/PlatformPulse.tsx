import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, BadgeCheck, CircleDollarSign, HeartHandshake, Layers3, Sparkles, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformPulseProps {
  activeWeekId: string | null;
}

interface PlatformPulseState {
  approvedSubmissions: number;
  validVotes: number;
  activeArtists: number;
  badgesAwarded: number;
  followLinks: number;
  rewardPoolEuros: number;
  topCategories: Array<{ name: string; count: number }>;
  latestChampions: Array<{ id: string; title: string; artist: string; rank: number }>;
}

const INITIAL_STATE: PlatformPulseState = {
  approvedSubmissions: 0,
  validVotes: 0,
  activeArtists: 0,
  badgesAwarded: 0,
  followLinks: 0,
  rewardPoolEuros: 0,
  topCategories: [],
  latestChampions: [],
};

export function PlatformPulse({ activeWeekId }: PlatformPulseProps) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PlatformPulseState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function loadPlatformPulse() {
      setLoading(true);
      try {
        const [{ data: follows }, { data: categories }] = await Promise.all([
          supabase.from("follows").select("id"),
          supabase.from("categories").select("id, name"),
        ]);

        const categoryMap = new Map((categories ?? []).map((category) => [category.id, category.name]));

        if (!activeWeekId) {
          if (!cancelled) {
            setState({
              ...INITIAL_STATE,
              followLinks: follows?.length ?? 0,
            });
          }
          return;
        }

        const [
          { data: submissions },
          { count: validVotes },
          { data: badges },
          { data: rewardPool },
          { data: latestWeek },
        ] = await Promise.all([
          supabase
            .from("submissions")
            .select("id, user_id, category_id")
            .eq("week_id", activeWeekId)
            .eq("status", "approved"),
          supabase
            .from("votes")
            .select("id", { count: "exact", head: true })
            .eq("week_id", activeWeekId)
            .eq("is_valid", true),
          supabase.from("weekly_badges").select("id").eq("week_id", activeWeekId),
          supabase.from("reward_pools").select("current_cents").eq("week_id", activeWeekId).maybeSingle(),
          supabase
            .from("weeks")
            .select("id")
            .not("results_published_at", "is", null)
            .order("results_published_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const approvedSubmissions = submissions?.length ?? 0;
        const activeArtists = new Set((submissions ?? []).map((submission) => submission.user_id)).size;
        const categoryCountMap = new Map<string, number>();

        for (const submission of submissions ?? []) {
          categoryCountMap.set(
            submission.category_id,
            (categoryCountMap.get(submission.category_id) ?? 0) + 1,
          );
        }

        let latestChampions: PlatformPulseState["latestChampions"] = [];
        if (latestWeek?.id) {
          const { data: winners } = await supabase
            .from("winners")
            .select("id, submission_id, rank")
            .eq("week_id", latestWeek.id)
            .lte("rank", 3)
            .order("rank");

          if (winners && winners.length > 0) {
            const { data: winnerSubmissions } = await supabase
              .from("submissions")
              .select("id, title, artist_name")
              .in("id", winners.map((winner) => winner.submission_id));

            const submissionMap = new Map(
              (winnerSubmissions ?? []).map((submission) => [submission.id, submission]),
            );

            latestChampions = winners.map((winner) => {
              const submission = submissionMap.get(winner.submission_id);
              return {
                id: winner.id,
                title: submission?.title ?? "Titre indisponible",
                artist: submission?.artist_name ?? "Artiste",
                rank: winner.rank,
              };
            });
          }
        }

        if (!cancelled) {
          setState({
            approvedSubmissions,
            validVotes: validVotes ?? 0,
            activeArtists,
            badgesAwarded: badges?.length ?? 0,
            followLinks: follows?.length ?? 0,
            rewardPoolEuros: (rewardPool?.current_cents ?? 0) / 100,
            topCategories: [...categoryCountMap.entries()]
              .map(([categoryId, count]) => ({
                name: categoryMap.get(categoryId) ?? "Catégorie",
                count,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 4),
            latestChampions,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlatformPulse();

    return () => {
      cancelled = true;
    };
  }, [activeWeekId]);

  const kpis = useMemo(
    () => [
      {
        label: "Titres validés cette semaine",
        value: state.approvedSubmissions,
        icon: Layers3,
        accent: "from-fuchsia-500/30 via-primary/20 to-cyan-500/20",
      },
      {
        label: "Votes réels enregistrés",
        value: state.validVotes,
        icon: BarChart3,
        accent: "from-cyan-500/30 via-blue-500/20 to-primary/20",
      },
      {
        label: "Artistes actifs",
        value: state.activeArtists,
        icon: Users,
        accent: "from-emerald-500/30 via-primary/20 to-lime-500/20",
      },
      {
        label: "Badges distribués",
        value: state.badgesAwarded,
        icon: BadgeCheck,
        accent: "from-amber-500/30 via-orange-500/20 to-primary/20",
      },
    ],
    [state.activeArtists, state.approvedSubmissions, state.badgesAwarded, state.validVotes],
  );

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 text-white shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.25),transparent_35%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="relative p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100/80">
                <Sparkles className="h-3.5 w-3.5" />
                Platform Pulse 2026
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Pilotage live côté utilisateur, sans données mockées.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                Les cartes et classements ci-dessous sont calculés à partir des tables Supabase actives : soumissions, votes, badges,
                follows, reward pool et derniers winners publiés.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <GlassStat icon={CircleDollarSign} label="Reward pool" value={`${state.rewardPoolEuros.toFixed(0)} €`} />
              <GlassStat icon={HeartHandshake} label="Relations follow" value={String(state.followLinks)} />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[1.5rem] bg-white/10" />)
                : kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                      <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.06 }}
                      >
                        <Card className="h-full overflow-hidden rounded-[1.5rem] border-white/10 bg-white/5 text-white backdrop-blur-xl">
                          <CardContent className="relative p-5">
                            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.accent} opacity-60`} />
                            <div className="relative flex h-full flex-col justify-between gap-6">
                              <div className="flex items-center justify-between">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                  <Icon className="h-5 w-5 text-cyan-100" />
                                </div>
                                <div className="text-right text-xs uppercase tracking-[0.2em] text-slate-300">Live</div>
                              </div>
                              <div>
                                <p className="text-4xl font-bold tracking-tight">{kpi.value}</p>
                                <p className="mt-2 text-sm text-slate-200">{kpi.label}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
            </div>

            <Card className="rounded-[1.5rem] border-white/10 bg-white/5 text-white backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Lignes fortes du moment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">Top catégories</p>
                  <div className="space-y-3">
                    {loading
                      ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-11 rounded-xl bg-white/10" />)
                      : state.topCategories.length > 0
                        ? state.topCategories.map((category, index) => (
                            <div key={category.name} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-100">{category.name}</span>
                                <span className="font-semibold text-cyan-100">{category.count}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-emerald-300"
                                  style={{ width: `${Math.max(18, ((state.topCategories.length - index) / state.topCategories.length) * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        : <p className="text-sm text-slate-300">Les prochaines catégories actives apparaîtront ici dès validation des titres.</p>}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">Derniers champions publiés</p>
                  <div className="space-y-3">
                    {loading
                      ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-xl bg-white/10" />)
                      : state.latestChampions.length > 0
                        ? state.latestChampions.map((winner) => (
                            <div key={winner.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                              <div>
                                <p className="font-medium text-white">{winner.title}</p>
                                <p className="text-sm text-slate-400">{winner.artist}</p>
                              </div>
                              <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-sm font-semibold text-amber-100">
                                #{winner.rank}
                              </div>
                            </div>
                          ))
                        : <p className="text-sm text-slate-300">Les gagnants publiés apparaîtront ici dès que la prochaine semaine sera révélée.</p>}
                  </div>
                </div>

                <Button asChild className="w-full rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                  <Link to="/impact">Voir le tableau d'impact live</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlassStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          <Icon className="h-4 w-4 text-cyan-100" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
