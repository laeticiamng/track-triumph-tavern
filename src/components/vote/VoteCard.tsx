import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Check, Play, Pause, Loader2, Star, Send, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ShareSheet } from "./ShareSheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface VoteCardSubmission {
  id: string;
  title: string;
  artist_name: string;
  cover_image_url: string;
  audio_excerpt_url: string;
  tags: string[] | null;
  user_id: string;
  category_id: string;
  category_name: string;
  artist_avatar: string | null;
  preview_start_sec?: number;
  preview_end_sec?: number;
}

interface VoteCardProps {
  submission: VoteCardSubmission;
  isVisible: boolean;
  canVote: boolean;
  hasVotedCategory: boolean;
  categoryName: string;
  onVoted: (categoryId: string, hadComment?: boolean) => void;
  isAuthenticated: boolean;
  tier: string;
  commentsUsed: number;
  commentsMax: number | "unlimited";
}

function StarRating({
  value,
  onChange,
  label,
  icon,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-[90px] flex items-center gap-1.5 text-white/80">
        <span>{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`Note ${star} sur 5`}
            className="p-0.5 transition-transform active:scale-90"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-white/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-white/50 w-5 text-right tabular-nums">{value}/5</span>
    </div>
  );
}

export function VoteCard({
  submission,
  isVisible,
  canVote,
  hasVotedCategory,
  categoryName,
  onVoted,
  isAuthenticated,
  tier,
  commentsUsed,
  commentsMax,
}: VoteCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voting, setVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { toast } = useToast();

  // Preview window
  const pStart = submission.preview_start_sec ?? 0;
  const pEnd = submission.preview_end_sec ?? 0;
  const hasPreview = pEnd > pStart;
  const windowDuration = hasPreview ? pEnd - pStart : duration;
  const displayTime = hasPreview ? Math.max(0, currentTime - pStart) : currentTime;

  // Scoring state
  const [emotionScore, setEmotionScore] = useState(3);
  const [originalityScore, setOriginalityScore] = useState(3);
  const [productionScore, setProductionScore] = useState(3);
  const [comment, setComment] = useState("");

  const canComment = tier !== "free" && (commentsMax === "unlimited" || commentsUsed < commentsMax);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isVisible) {
      if (hasPreview) audio.currentTime = pStart;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [isVisible, hasPreview, pStart]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (hasPreview && audio.currentTime >= pEnd) {
        audio.pause();
        setPlaying(false);
      }
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [hasPreview, pEnd]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (hasPreview && (audio.currentTime < pStart || audio.currentTime >= pEnd)) {
        audio.currentTime = pStart;
      }
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing, hasPreview, pStart, pEnd]);

  const seek = useCallback((value: number[]) => {
    if (audioRef.current) {
      const target = hasPreview ? value[0] + pStart : value[0];
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  }, [hasPreview, pStart]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleVote = async () => {
    if (!canVote || voting) return;
    setVoting(true);
    try {
      const trimmedComment = comment.trim();
      const { data, error } = await supabase.functions.invoke("cast-vote", {
        body: {
          submission_id: submission.id,
          emotion_score: emotionScore,
          originality_score: originalityScore,
          production_score: productionScore,
          ...(trimmedComment && canComment ? { comment: trimmedComment } : {}),
        },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" });
      } else {
        setJustVoted(true);
        setShowPanel(false);
        onVoted(submission.category_id, !!(trimmedComment && canComment));
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de voter.", variant: "destructive" });
    } finally {
      setVoting(false);
    }
  };

  const avgScore = ((emotionScore + originalityScore + productionScore) / 3).toFixed(1);
  const showAlreadyVoted = hasVotedCategory && !justVoted;

  return (
    <div className="relative h-full w-full snap-start flex flex-col">
      <audio ref={audioRef} src={submission.audio_excerpt_url} preload="metadata" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />

      {/* Cover background */}
      <div className="absolute inset-0">
        <img
          src={submission.cover_image_url}
          alt={submission.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-1 flex-col justify-end p-5 pb-6">
        {/* Category + tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-primary/90 text-primary-foreground text-xs border-0">
            {categoryName}
          </Badge>
          {submission.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="border-white/30 text-white/70 text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title + artist */}
        <Link to={`/submissions/${submission.id}`} className="hover:underline">
          <h2 className="font-display text-2xl font-bold text-white leading-tight mb-1">
            {submission.title}
          </h2>
        </Link>
        <Link
          to={`/artist/${submission.user_id}`}
          className="flex items-center gap-2 mb-5 group"
        >
          <div className="h-7 w-7 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
            {submission.artist_avatar ? (
              <img src={submission.artist_avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/40" />
            )}
          </div>
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
            {submission.artist_name}
          </span>
        </Link>

        {/* Audio player */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={togglePlay}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors active:scale-95"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <Slider
              value={[Math.max(0, displayTime)]}
              max={windowDuration || 100}
              step={0.1}
              onValueChange={seek}
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs text-white/60 tabular-nums w-10 text-right">
            {fmt(Math.max(0, displayTime))}
          </span>
        </div>

        {/* Scoring Panel (expandable) */}
        <AnimatePresence>
          {showPanel && canVote && isAuthenticated && !justVoted && !showAlreadyVoted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-2xl bg-black/60 backdrop-blur-md p-4 space-y-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                    Tes notes
                  </span>
                  <span className="text-xs text-white/50">
                    Moyenne: <span className="text-white font-medium">{avgScore}/5</span>
                  </span>
                </div>

                <StarRating value={emotionScore} onChange={setEmotionScore} label="Emotion" icon="💖" />
                <StarRating value={originalityScore} onChange={setOriginalityScore} label="Originalité" icon="✨" />
                <StarRating value={productionScore} onChange={setProductionScore} label="Production" icon="🎛️" />

                {/* Comment (Pro/Elite) */}
                {canComment && (
                  <div className="mt-2">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 280))}
                      placeholder="Laisser un commentaire (optionnel)..."
                      rows={2}
                      maxLength={280}
                      className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-white/40">
                        {tier === "pro" ? `${commentsUsed}/${commentsMax} commentaires` : "Illimité"}
                      </span>
                      <span className="text-[10px] text-white/40">{comment.length}/280</span>
                    </div>
                  </div>
                )}

                {/* Submit vote button */}
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 text-sm transition-colors active:scale-[0.98]"
                >
                  {voting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Valider mon vote ({avgScore}/5)
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            {/* Vote */}
            {justVoted ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/90">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-green-400">Voté</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) return;
                  if (showPanel) {
                    setShowPanel(false);
                  } else if (canVote && !showAlreadyVoted) {
                    setShowPanel(true);
                  }
                }}
                disabled={!canVote || showAlreadyVoted}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  canVote && isAuthenticated && !showAlreadyVoted
                    ? "text-white/80 hover:text-white"
                    : "text-white/30"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm ${
                    showPanel
                      ? "bg-primary/80 text-white"
                      : canVote && isAuthenticated && !showAlreadyVoted
                      ? "bg-white/15 hover:bg-primary/80"
                      : "bg-white/10"
                  }`}
                >
                  {showPanel ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </div>
                <span className="text-[10px] font-medium">
                  {!isAuthenticated ? "Connexion" : showPanel ? "Fermer" : "Voter"}
                </span>
              </button>
            )}

            {/* Detail */}
            <Link
              to={`/submissions/${submission.id}`}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">Détail</span>
            </Link>

            {/* Share */}
            <ShareSheet
              title={submission.title}
              artistName={submission.artist_name}
              submissionId={submission.id}
            />
          </div>

          {/* Status message */}
          <AnimatePresence>
            {justVoted && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-white/70 italic max-w-[140px] text-right"
              >
                Merci, ton vote compte.
              </motion.p>
            )}
            {showAlreadyVoted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-white/50 max-w-[160px] text-right"
              >
                Déjà voté en {categoryName} cette semaine
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
