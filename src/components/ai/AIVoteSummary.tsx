import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, Target, Lightbulb } from "lucide-react";

interface VoteSummary {
  strengths: string;
  improvements: string;
  overall: string;
}

interface AIVoteSummaryProps {
  tier: string;
}

export function AIVoteSummary({ tier }: AIVoteSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<VoteSummary | null>(null);
  const [stats, setStats] = useState<{ totalVotes: number; avgScores: Record<string, number> } | null>(null);

  const isAvailable = tier === "pro" || tier === "elite";

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-vote-summary");
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        console.error("AI summary error:", result.error);
      } else {
        setSummary(result.summary);
        setStats(result.stats || null);
      }
    } catch (err) {
      console.error("AI vote summary error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Brain className="h-5 w-5" /> Résumé IA de vos votes
        </CardTitle>
        {!summary && (
          <Button size="sm" onClick={handleGenerate} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
            Analyser
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Cliquez sur "Analyser" pour obtenir un résumé IA des retours reçus sur vos morceaux.
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Analyse en cours...</span>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            {stats && (
              <div className="flex gap-4 text-center text-sm">
                <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                  <p className="font-bold text-lg">{stats.totalVotes}</p>
                  <p className="text-xs text-muted-foreground">votes analysés</p>
                </div>
                {stats.avgScores?.originality > 0 && (
                  <>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.originality.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Originalité</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.production.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Production</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.emotion.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Émotion</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              {summary.strengths && (
                <div className="flex gap-3 items-start">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Points forts</p>
                    <p className="text-sm text-muted-foreground">{summary.strengths}</p>
                  </div>
                </div>
              )}
              {summary.improvements && (
                <div className="flex gap-3 items-start">
                  <Target className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Axes d'amélioration</p>
                    <p className="text-sm text-muted-foreground">{summary.improvements}</p>
                  </div>
                </div>
              )}
              {summary.overall && (
                <div className="flex gap-3 items-start">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Résumé</p>
                    <p className="text-sm text-muted-foreground">{summary.overall}</p>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Rafraîchir l'analyse
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
