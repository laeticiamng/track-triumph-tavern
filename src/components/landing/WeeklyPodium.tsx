import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PodiumEntry {
  rank: number;
  artist_name: string;
  title: string;
  cover_image_url: string;
  submission_id: string;
}

const medalColors: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

const medalLabels: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function WeeklyPodium({ compact = false }: { compact?: boolean }) {
  const [entries, setEntries] = useState<PodiumEntry[]>([]);
  const [weekTitle, setWeekTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPodium() {
      // Get the latest week with published results
      const { data: week } = await supabase
        .from("weeks")
        .select("id, title, week_number, results_published_at, seasons(name)")
        .not("results_published_at", "is", null)
        .order("results_published_at", { ascending: false })
        .limit(1)
        .single();

      if (!week) {
        setLoading(false);
        return;
      }

      const season = (week as { seasons?: { name: string } | null }).seasons?.name || "Saison 1";
      setWeekTitle(`${season} — ${week.title || `Semaine ${week.week_number}`}`);

      // Get top 3 winners for that week
      const { data: winners } = await supabase
        .from("winners")
        .select("rank, submission_id")
        .eq("week_id", week.id)
        .lte("rank", 3)
        .order("rank");

      if (!winners || winners.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch submission details
      const subIds = winners.map((w) => w.submission_id);
      const { data: subs } = await supabase
        .from("submissions")
        .select("id, title, artist_name, cover_image_url")
        .in("id", subIds);

      if (subs) {
        const mapped: PodiumEntry[] = winners.map((w) => {
          const sub = subs.find((s) => s.id === w.submission_id);
          return {
            rank: w.rank,
            artist_name: sub?.artist_name || "Artiste",
            title: sub?.title || "Sans titre",
            cover_image_url: sub?.cover_image_url || "/placeholder.svg",
            submission_id: w.submission_id,
          };
        });
        setEntries(mapped);
      }
      setLoading(false);
    }
    fetchPodium();
  }, []);

  if (loading || entries.length === 0) return null;

  if (compact) {
    return (
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Podium de la semaine</span>
            {weekTitle && (
              <span className="text-xs text-muted-foreground">· {weekTitle}</span>
            )}
          </div>
          <Link
            to="/results"
            className="text-xs font-medium text-primary hover:underline"
          >
            Voir les résultats →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {entries.map((e) => (
            <Link
              key={e.submission_id}
              to={`/submissions/${e.submission_id}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 hover:border-primary/30 transition-colors"
            >
              <span className="text-lg">{medalLabels[e.rank]}</span>
              <img
                src={e.cover_image_url}
                alt={e.title}
                className="h-8 w-8 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.artist_name}</p>
                <p className="truncate text-xs text-muted-foreground">{e.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Trophy className="h-4 w-4" />
            Podium de la semaine
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Les gagnants de la semaine
          </h2>
          {weekTitle && (
            <p className="mt-2 text-muted-foreground">{weekTitle}</p>
          )}
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Show in order: 2nd, 1st, 3rd for visual podium effect on desktop */}
          {[entries.find((e) => e.rank === 2), entries.find((e) => e.rank === 1), entries.find((e) => e.rank === 3)]
            .filter(Boolean)
            .map((entry, i) => {
              const e = entry!;
              const isFirst = e.rank === 1;
              return (
                <motion.div
                  key={e.submission_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Link
                    to={`/submissions/${e.submission_id}`}
                    className={`group block rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-soft hover:border-primary/20 ${
                      isFirst ? "sm:scale-110 border-primary/30 shadow-soft" : "border-border"
                    }`}
                    style={{ width: isFirst ? 260 : 220 }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 left-3 text-2xl">{medalLabels[e.rank]}</span>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="truncate font-display text-base font-semibold text-white">
                          {e.title}
                        </h3>
                        <p className="truncate text-sm text-white/70">{e.artist_name}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/results"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Voir tous les résultats →
          </Link>
        </div>
      </div>
    </section>
  );
}
