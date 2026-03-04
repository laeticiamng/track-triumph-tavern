import { Play, Pause, X, SkipBack, SkipForward } from "lucide-react";
import { useGlobalAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Waveform } from "@/components/audio/Waveform";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function PersistentAudioPlayer() {
  const { t } = useTranslation();
  const { track, playing, currentTime, duration, waveform, togglePlay, seek, close } = useGlobalAudioPlayer();

  if (!track) return null;

  const hasPreview = (track.previewStart ?? 0) > 0 || (track.previewEnd ?? 0) > 0;
  const effectiveStart = track.previewStart ?? 0;
  const effectiveEnd = track.previewEnd ?? duration;
  const effectiveDuration = effectiveEnd - effectiveStart;
  const displayTime = hasPreview ? Math.max(0, currentTime - effectiveStart) : currentTime;
  const progress = effectiveDuration > 0 ? displayTime / effectiveDuration : 0;

  const handleSeek = (pct: number) => {
    const target = hasPreview
      ? effectiveStart + pct * effectiveDuration
      : pct * duration;
    seek(target);
  };

  const skipBack = () => {
    seek(Math.max(effectiveStart, currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(effectiveEnd, currentTime + 10));
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="persistent-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 md:bottom-0 left-0 right-0 z-[60] md:z-50"
        style={{ bottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Mobile: stacked above bottom nav */}
        <div className="md:hidden mb-16">
          <div className="mx-2 rounded-t-2xl border border-b-0 border-border bg-card/95 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-3 px-3 py-2">
              {/* Cover */}
              <img
                src={track.coverUrl}
                alt={track.title}
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              {/* Controls */}
              <button
                onClick={togglePlay}
                aria-label={playing ? t("a11y.pause") : t("a11y.playExcerpt")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                onClick={close}
                aria-label={t("common.close")}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {/* Mini waveform */}
            <div className="h-6 px-3 pb-2">
              <Waveform peaks={waveform} progress={progress} onSeek={handleSeek} className="h-full" />
            </div>
          </div>
        </div>

        {/* Desktop: full-width bar */}
        <div className="hidden md:block border-t border-border bg-card/95 backdrop-blur-xl">
          <div className="container flex items-center gap-4 h-[72px]">
            {/* Cover + info */}
            <div className="flex items-center gap-3 w-56 flex-shrink-0">
              <img
                src={track.coverUrl}
                alt={track.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={skipBack}
                aria-label={t("player.skipBack", "Reculer de 10s")}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={playing ? t("a11y.pause") : t("a11y.playExcerpt")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                onClick={skipForward}
                aria-label={t("player.skipForward", "Avancer de 10s")}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* Time + Waveform */}
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
              {fmt(Math.max(0, displayTime))}
            </span>
            <div className="flex-1 h-10">
              <Waveform peaks={waveform} progress={progress} onSeek={handleSeek} className="h-full" />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-10">
              {fmt(effectiveDuration)}
            </span>

            {/* Close */}
            <button
              onClick={close}
              aria-label={t("common.close")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors ml-2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
