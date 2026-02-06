import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  compact?: boolean;
}

export function AudioPlayer({ src, title, artist, coverUrl, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const seek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
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
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          onClick={toggle}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
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
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
          {fmt(currentTime)}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <audio ref={audioRef} src={src} preload="metadata" />

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
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={seek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
