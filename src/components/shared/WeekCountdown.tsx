import { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";

interface WeekCountdownProps {
  targetDate: string;
  label?: string;
  className?: string;
  /** Variant: "default" small inline, "hero" large prominent display */
  variant?: "default" | "hero";
}

/**
 * Compute the next 7-day cycle from the original target date.
 * If the target date is past, we keep adding 7 days until we find a future date.
 */
function getNextCycleTarget(originalTarget: string): { target: Date; cycleNumber: number } {
  const target = new Date(originalTarget);
  const now = new Date();
  let cycleNumber = 0;

  while (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
    cycleNumber++;
  }

  return { target, cycleNumber };
}

export function WeekCountdown({
  targetDate,
  label = "Fin du vote dans",
  className = "",
  variant = "default",
}: WeekCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isNewCycle, setIsNewCycle] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calc = () => {
      const { target, cycleNumber } = getNextCycleTarget(targetDate);
      setIsNewCycle(cycleNumber > 0);

      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Nouvelle session...");
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);

      if (d > 0) {
        setTimeLeft(`${d}j ${h}h ${m}min`);
      } else if (h > 0) {
        setTimeLeft(`${h}h ${m}min ${s}s`);
      } else if (m > 0) {
        setTimeLeft(`${m}min ${s}s`);
      } else {
        setTimeLeft(`${s}s`);
      }
    };

    calc();
    const interval = setInterval(calc, 1_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const currentLabel = isNewCycle ? "Prochaine session dans" : label;

  if (variant === "hero") {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`} role="timer" aria-live="polite" aria-label={`${currentLabel} ${timeLeft}`}>
        <div className="flex items-center gap-2 text-sm font-medium opacity-80">
          {isNewCycle ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          ) : (
            <Clock className="h-3.5 w-3.5" />
          )}
          <span>{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <TimeBlock value={days} unit="j" />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={hours} unit="h" />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={minutes} unit="m" />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={seconds} unit="s" />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${className}`} role="timer" aria-live="polite" aria-label={`${currentLabel} ${timeLeft}`}>
      {isNewCycle ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} aria-hidden="true" />
      ) : (
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{currentLabel} <strong>{timeLeft}</strong></span>
    </div>
  );
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
        {unit}
      </span>
    </div>
  );
}
