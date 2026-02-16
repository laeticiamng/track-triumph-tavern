import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Star, Sparkles, Music2, ChevronDown, ChevronUp, Check, Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type ScoringCriterion = { criterion: string; weight: number; description: string };

interface VoteButtonProps {
  submissionId: string;
  categoryId?: string;
  onVoted?: (hadComment?: boolean) => void;
  hasVoted?: boolean;
  compact?: boolean;
  tier?: string;
  commentsUsed?: number;
  commentsMax?: number | "unlimited";
}

export function VoteButton({ submissionId, categoryId, onVoted, hasVoted = false, compact = false, tier = "free", commentsUsed = 0, commentsMax = 0 }: VoteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(hasVoted);
  const [showDetails, setShowDetails] = useState(false);
  const [originality, setOriginality] = useState<number>(3);
  const [production, setProduction] = useState<number>(3);
  const [emotion, setEmotion] = useState<number>(3);
  const [comment, setComment] = useState("");
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriterion[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    supabase
      .from("categories")
      .select("scoring_criteria")
      .eq("id", categoryId)
      .single()
      .then(({ data }) => {
        if (data?.scoring_criteria) {
          setScoringCriteria(data.scoring_criteria as unknown as ScoringCriterion[]);
        }
      }).catch(() => {});
  }, [categoryId]);

  if (!user) {
    return (
      <Button variant="outline" size={compact ? "sm" : "default"} asChild>
        <Link to="/auth">
          <Heart className="mr-2 h-4 w-4" /> Connectez-vous pour voter
        </Link>
      </Button>
    );
  }

  if (voted) {
    return (
      <Button disabled size={compact ? "sm" : "default"} className="bg-green-600 hover:bg-green-600 text-white">
        <Check className="mr-2 h-4 w-4" /> Voté
      </Button>
    );
  }

  const canComment = tier === "free" ? false : commentsMax === "unlimited" ? true : commentsUsed < commentsMax;

  const handleVote = async () => {
    setLoading(true);
    const hadComment = showDetails && comment.trim().length > 0 && canComment;
    try {
      const { data, error } = await supabase.functions.invoke("cast-vote", {
        body: {
          submission_id: submissionId,
          originality_score: showDetails ? originality : undefined,
          production_score: showDetails ? production : undefined,
          emotion_score: showDetails ? emotion : undefined,
          comment: hadComment ? comment.trim() : undefined,
        },
      });

      if (error) throw error;

      const result = typeof data === "string" ? JSON.parse(data) : data;

      if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" });
      } else {
        setVoted(true);
        toast({ title: "Vote enregistré !", description: "Merci pour votre vote." });
        onVoted?.(hadComment);
      }
    } catch (err) {
      console.error("Vote error:", err);
      toast({ title: "Erreur", description: "Impossible de voter. Réessayez.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Button size="sm" onClick={handleVote} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
        Voter
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button onClick={handleVote} disabled={loading} className="flex-1 bg-gradient-primary hover:opacity-90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
          Voter pour ce titre
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowDetails(!showDetails)}
          aria-label="Détails du vote"
        >
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">Notes optionnelles (1-5)</p>

            {/* Contextual scoring tips */}
            {scoringCriteria.length > 0 && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Conseils pour cette catégorie
                </div>
                {scoringCriteria.map((sc) => {
                  const criterionKey = sc.criterion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  const icon = criterionKey.includes("original") ? "💡" : criterionKey.includes("emotion") ? "❤️" : "🎛️";
                  return (
                    <p key={sc.criterion} className="text-xs text-muted-foreground leading-relaxed">
                      <span className="mr-1">{icon}</span>
                      <span className="font-medium text-foreground">{sc.criterion} ({sc.weight}%)</span> — {sc.description}
                    </p>
                  );
                })}
              </div>
            )}

            <ScoreSlider
              icon={<Sparkles className="h-4 w-4 text-yellow-500" />}
              label="Originalité"
              value={originality}
              onChange={setOriginality}
              tip={scoringCriteria.find((s) => s.criterion === "Originalité")?.description}
            />
            <ScoreSlider
              icon={<Music2 className="h-4 w-4 text-blue-500" />}
              label="Production"
              value={production}
              onChange={setProduction}
              tip={scoringCriteria.find((s) => s.criterion === "Production")?.description}
            />
            <ScoreSlider
              icon={<Star className="h-4 w-4 text-rose-500" />}
              label="Émotion"
              value={emotion}
              onChange={setEmotion}
              tip={scoringCriteria.find((s) => s.criterion === "Émotion")?.description}
            />

            {/* Comment section with tier-based gating */}
            {tier === "free" ? (
              <p className="text-xs text-muted-foreground italic">
                <Link to="/pricing" className="text-primary hover:underline">Passez à Pro</Link> pour laisser un commentaire
              </p>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Commentaire (optionnel)</label>
                  <span className="text-xs text-muted-foreground">
                    {commentsMax === "unlimited"
                      ? "Commentaires illimités"
                      : `${commentsUsed}/${commentsMax} cette semaine`}
                  </span>
                </div>
                {canComment ? (
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Un mot sur ce titre..."
                    className="mt-1 resize-none"
                    rows={2}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Quota de commentaires atteint cette semaine.{" "}
                    {tier === "pro" && <Link to="/pricing" className="text-primary hover:underline">Passez à Elite pour des commentaires illimités</Link>}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreSlider({
  icon,
  label,
  value,
  onChange,
  tip,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  tip?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="w-20 text-sm">{label}</span>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="flex-1"
          aria-label={`Note ${label}`}
        />
        <span className="w-6 text-center text-sm font-medium" aria-live="polite">{value}</span>
      </div>
    </div>
  );
}
