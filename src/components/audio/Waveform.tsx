import { useRef, useEffect, memo } from "react";

interface WaveformProps {
  peaks: number[];
  progress: number; // 0..1
  onSeek?: (progress: number) => void;
  className?: string;
}

export const Waveform = memo(function Waveform({ peaks, progress, onSeek, className = "" }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const barCount = peaks.length;
    const gap = 1.5;
    const barWidth = Math.max(1, (w - gap * (barCount - 1)) / barCount);
    const centerY = h / 2;
    const maxBarH = h * 0.45;
    const minBarH = 2;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      const barH = Math.max(minBarH, peaks[i] * maxBarH);
      const progressIndex = progress * barCount;

      // Gradient: played = primary, unplayed = muted
      const isPlayed = i < progressIndex;
      const isActive = Math.abs(i - progressIndex) < 1;

      if (isActive) {
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.globalAlpha = 1;
      } else if (isPlayed) {
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.globalAlpha = 0.85;
      } else {
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.globalAlpha = 0.3;
      }

      // Top half
      ctx.beginPath();
      ctx.roundRect(x, centerY - barH, barWidth, barH, 1);
      ctx.fill();

      // Bottom mirror (shorter)
      ctx.globalAlpha *= 0.4;
      ctx.beginPath();
      ctx.roundRect(x, centerY + 1, barWidth, barH * 0.5, 1);
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }, [peaks, progress]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onSeek(Math.max(0, Math.min(1, x / rect.width)));
  };

  if (peaks.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex items-end gap-[2px] h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-muted-foreground/20 animate-pulse"
              style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-full cursor-pointer ${className}`}
      onClick={handleClick}
      style={{ height: "100%" }}
    />
  );
});
