import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Check, Play, Pause, Loader2 } from "lucide-react";
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
  const { toast } = useToast();

  // Auto-play/pause based on visibility
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isVisible) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [isVisible]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
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
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  const seek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleVote = async () => {
    if (!canVote || voting) return;
    setVoting(true);
    try {
      const { data, error } = await supabase.functions.invoke("cast-vote", {
        body: { submission_id: submission.id },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" });
      } else {
        setJustVoted(true);
        onVoted(submission.category_id);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de voter.", variant: "destructive" });
    } finally {
      setVoting(false);
    }
  };

  const showAlreadyVoted = hasVotedCategory && !justVoted;

  return (
    <div className="relative h-full w-full snap-start flex flex-col">
      <audio ref={audioRef} src={submission.audio_excerpt_url} preload="metadata" />

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
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={seek}
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs text-white/60 tabular-nums w-10 text-right">
            {fmt(currentTime)}
          </span>
        </div>

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
                onClick={isAuthenticated ? handleVote : undefined}
                disabled={!canVote || voting}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  canVote && isAuthenticated
                    ? "text-white/80 hover:text-white"
                    : "text-white/30"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm ${
                    canVote && isAuthenticated ? "bg-white/15 hover:bg-primary/80" : "bg-white/10"
                  }`}
                >
                  {voting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </div>
                <span className="text-[10px] font-medium">
                  {!isAuthenticated ? "Connexion" : "Voter"}
                </span>
              </button>
            )}

            {/* Comment */}
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
