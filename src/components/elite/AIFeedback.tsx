import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music2, Star, Lightbulb, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface AIFeedbackProps {
  submission: {
    title: string;
    artist_name: string;
    description: string | null;
    tags: string[] | null;
    category_name?: string;
  };
}

interface Feedback {
  vibe: string;
  structure: string;
  production: string;
  suggestions: string[];
}

export function AIFeedback({ submission }: AIFeedbackProps) {
  const { tier } = useSubscription();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isElite = tier === "elite";

  const requestFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-feedback", {
        body: {
          title: submission.title,
          artist_name: submission.artist_name,
          description: submission.description,
          tags: submission.tags,
          category: submission.category_name,
        },
      });
      if (fnError) throw fnError;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) throw new Error(result.error);
      setFeedback(result.feedback);
    } catch (err: any) {
      setError("Impossible de générer le feedback. Réessayez.");
      console.error("AI feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isElite) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <Lock className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Le feedback IA est réservé aux abonnés Elite</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">Passer à Elite</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <Sparkles className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Obtenez un feedback IA structuré sur votre morceau</p>
          <Button onClick={requestFeedback} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Générer le feedback
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  const sections = [
    { key: "vibe", label: "Ambiance", icon: <Star className="h-4 w-4 text-primary" />, content: feedback.vibe },
    { key: "structure", label: "Structure", icon: <Music2 className="h-4 w-4 text-blue-500" />, content: feedback.structure },
    { key: "production", label: "Production", icon: <Sparkles className="h-4 w-4 text-amber-500" />, content: feedback.production },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Feedback IA
            <Badge className="bg-primary/10 text-primary text-xs">Elite</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((s) => (
            <div key={s.key} className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                {s.icon} {s.label}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}

          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-green-500" /> Suggestions
              </div>
              <ul className="space-y-1">
                {feedback.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-medium">{i + 1}.</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
