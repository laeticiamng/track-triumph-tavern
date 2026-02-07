import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, ArrowLeft, Music } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Week = Tables<"weeks">;
type Submission = Tables<"submissions">;

interface WeekResult {
  week: Week;
  topSubmissions: Submission[];
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
      // Get published weeks
      const { data: weeks } = await supabase
        .from("weeks")
        .select("*")
        .not("results_published_at", "is", null)
        .order("results_published_at", { ascending: false });

      if (!weeks || weeks.length === 0) {
        setLoading(false);
        return;
      }

      // For each week, get top 3 submissions
      const weekResults: WeekResult[] = [];
      for (const week of weeks) {
        const { data: subs } = await supabase
          .from("submissions")
          .select("*")
          .eq("week_id", week.id)
          .eq("status", "approved")
          .order("vote_count", { ascending: false })
          .limit(3);

        weekResults.push({ week, topSubmissions: subs || [] });
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
              {results.map(({ week, topSubmissions }) => (
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

                  {topSubmissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune soumission cette semaine.</p>
                  ) : (
                    <div className="space-y-3">
                      {topSubmissions.map((sub, idx) => {
                        const medal = medals[idx];
                        const Icon = medal?.icon || Medal;
                        return (
                          <Link
                            key={sub.id}
                            to={`/submissions/${sub.id}`}
                            className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-accent/50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center">
                              <Icon className={`h-6 w-6 ${medal?.color || "text-muted-foreground"}`} />
                            </div>
                            <img
                              src={sub.cover_image_url}
                              alt={sub.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{sub.title}</p>
                              <p className="truncate text-sm text-muted-foreground">{sub.artist_name}</p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {sub.vote_count} vote{sub.vote_count !== 1 ? "s" : ""}
                            </span>
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
