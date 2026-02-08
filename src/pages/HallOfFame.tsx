import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, ArrowLeft, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Week = Tables<"weeks">;

interface WinnerWithSubmission {
  id: string;
  rank: number;
  vote_count: number;
  weighted_score: number | null;
  submission_id: string;
  submissions: {
    title: string;
    artist_name: string;
    cover_image_url: string;
  } | null;
}

interface WeekResult {
  week: Week;
  winners: WinnerWithSubmission[];
}

const medals = [
  { icon: Trophy, color: "text-yellow-500", label: "1er" },
  { icon: Medal, color: "text-gray-400", label: "2e" },
  { icon: Medal, color: "text-amber-700", label: "3e" },
];

const HallOfFame = () => {
  const [results, setResults] = useState<WeekResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data: weeks } = await supabase
        .from("weeks")
        .select("*")
        .not("results_published_at", "is", null)
        .order("results_published_at", { ascending: false });

      if (!weeks || weeks.length === 0) {
        setLoading(false);
        return;
      }

      const weekResults: WeekResult[] = [];
      for (const week of weeks) {
        const { data: winners } = await supabase
          .from("winners")
          .select("id, rank, vote_count, weighted_score, submission_id, submissions(title, artist_name, cover_image_url)")
          .eq("week_id", week.id)
          .order("rank")
          .limit(3);

        weekResults.push({ week, winners: (winners as any) || [] });
      }

      setResults(weekResults);
      setLoading(false);
    };

    fetchResults();
  }, []);

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container max-w-3xl">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <h1 className="font-display text-3xl font-bold sm:text-4xl">Hall of Fame</h1>
          <p className="mt-2 text-muted-foreground">Archives des gagnants de chaque semaine.</p>

          {loading ? (
            <div className="mt-8 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <Music className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-semibold">Aucun résultat publié</h3>
              <p className="mt-1 text-sm text-muted-foreground">Les résultats apparaîtront ici une fois publiés.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {results.map(({ week, winners }) => (
                <div key={week.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <h2 className="font-display text-lg font-semibold">
                      {week.title || `Semaine ${week.week_number}`}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Résultats publiés le{" "}
                      {new Date(week.results_published_at!).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {winners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune soumission cette semaine.</p>
                  ) : (
                    <div className="space-y-3">
                      {winners.map((w, idx) => {
                        const medal = medals[idx];
                        const Icon = medal?.icon || Medal;
                        return (
                          <Link
                            key={w.id}
                            to={`/submissions/${w.submission_id}`}
                            className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-accent/50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center">
                              <Icon className={`h-6 w-6 ${medal?.color || "text-muted-foreground"}`} />
                            </div>
                            <img
                              src={w.submissions?.cover_image_url}
                              alt={w.submissions?.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{w.submissions?.title}</p>
                              <p className="truncate text-sm text-muted-foreground">{w.submissions?.artist_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {w.weighted_score != null && w.weighted_score > 0 && (
                                <Badge className="bg-primary/10 text-primary text-xs font-display">
                                  {Number(w.weighted_score).toFixed(1)}/5
                                </Badge>
                              )}
                              <span className="text-sm font-semibold tabular-nums">
                                {w.vote_count} vote{w.vote_count !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default HallOfFame;
