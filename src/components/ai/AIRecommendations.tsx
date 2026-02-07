import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface AIRecommendationsProps {
  weekId: string | null;
  onRecommendations: (ids: string[]) => void;
}

export function AIRecommendations({ weekId, onRecommendations }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);

  useEffect(() => {
    if (!weekId) return;

    const fetchRecs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-recommendations", {
          body: { week_id: weekId },
        });
        if (error) throw error;
        const result = typeof data === "string" ? JSON.parse(data) : data;
        if (result.recommended_ids && result.recommended_ids.length > 0) {
          onRecommendations(result.recommended_ids);
          setHasRecommendations(true);
        }
      } catch (err) {
        console.error("AI recommendations error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [weekId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">IA analyse vos goûts...</span>
      </div>
    );
  }

  if (hasRecommendations) {
    return (
      <Badge variant="outline" className="border-primary/30 text-primary gap-1 text-xs">
        <Sparkles className="h-3 w-3" /> Recommandés pour vous
      </Badge>
    );
  }

  return null;
}
