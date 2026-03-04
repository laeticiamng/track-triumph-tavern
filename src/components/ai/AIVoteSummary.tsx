import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          <Brain className="h-5 w-5" /> {t("aiSummary.title")}
        </CardTitle>
        {!summary && (
          <Button size="sm" onClick={handleGenerate} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
            {t("aiSummary.analyze")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("aiSummary.emptyState")}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">{t("aiSummary.loading")}</span>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            {stats && (
              <div className="flex gap-4 text-center text-sm">
                <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                  <p className="font-bold text-lg">{stats.totalVotes}</p>
                  <p className="text-xs text-muted-foreground">{t("aiSummary.votesAnalyzed")}</p>
                </div>
                {stats.avgScores?.originality > 0 && (
                  <>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.originality.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{t("aiSummary.originality")}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.production.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{t("aiSummary.production")}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 px-3 py-2 flex-1">
                      <p className="font-bold text-lg">{stats.avgScores.emotion.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{t("aiSummary.emotion")}</p>
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
                    <p className="text-sm font-medium">{t("aiSummary.strengths")}</p>
                    <p className="text-sm text-muted-foreground">{summary.strengths}</p>
                  </div>
                </div>
              )}
              {summary.improvements && (
                <div className="flex gap-3 items-start">
                  <Target className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t("aiSummary.improvements")}</p>
                    <p className="text-sm text-muted-foreground">{summary.improvements}</p>
                  </div>
                </div>
              )}
              {summary.overall && (
                <div className="flex gap-3 items-start">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t("aiSummary.overall")}</p>
                    <p className="text-sm text-muted-foreground">{summary.overall}</p>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              {t("aiSummary.refresh")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
