import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  compact?: boolean;
  previewStart?: number;
  previewEnd?: number;
}

export function AudioPlayer({ src, title, artist, coverUrl, compact = false, previewStart, previewEnd }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hasPreviewWindow = previewStart != null && previewEnd != null && previewEnd > previewStart;
  const windowDuration = hasPreviewWindow ? previewEnd! - previewStart! : duration;
  const displayTime = hasPreviewWindow ? currentTime - previewStart! : currentTime;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      // Auto-stop at preview end
      if (hasPreviewWindow && audio.currentTime >= previewEnd!) {
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
  }, [hasPreviewWindow, previewEnd]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      // Start from preview start if before window or past end
      if (hasPreviewWindow) {
        if (audioRef.current.currentTime < previewStart! || audioRef.current.currentTime >= previewEnd!) {
          audioRef.current.currentTime = previewStart!;
        }
      }
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const seek = (value: number[]) => {
    if (audioRef.current) {
      const target = hasPreviewWindow ? value[0] + previewStart! : value[0];
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <audio ref={audioRef} src={src} preload="metadata" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
        <button
          onClick={toggle}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
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
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
          {fmt(Math.max(0, displayTime))}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <audio ref={audioRef} src={src} preload="metadata" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />

      <div className="flex items-center gap-4">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={title || "Cover"}
            className="h-14 w-14 rounded-xl object-cover"
          />
        )}

        <div className="flex-1 min-w-0">
          {title && <p className="truncate text-sm font-medium">{title}</p>}
          {artist && <p className="truncate text-xs text-muted-foreground">{artist}</p>}

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={toggle}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>
            <Slider
              value={[Math.max(0, displayTime)]}
              max={windowDuration || 100}
              step={0.1}
              onValueChange={seek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(Math.max(0, displayTime))} / {fmt(windowDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
