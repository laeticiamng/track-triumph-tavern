import { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeekCountdownProps {
  targetDate: string;
  label?: string;
  className?: string;
  variant?: "default" | "hero";
}

function getNextCycleTarget(originalTarget: string): { target: Date; cycleNumber: number } {
  const target = new Date(originalTarget);
  const now = new Date();
  let cycleNumber = 0;
  while (target.getTime() <= now.getTime()) { target.setDate(target.getDate() + 7); cycleNumber++; }
  return { target, cycleNumber };
}

export function WeekCountdown({ targetDate, label, className = "", variant = "default" }: WeekCountdownProps) {
  const { t } = useTranslation();
  const defaultLabel = label || t("countdown.voteEndIn");
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
      if (diff <= 0) { setTimeLeft(t("countdown.newSession")); setDays(0); setHours(0); setMinutes(0); setSeconds(0); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setDays(d); setHours(h); setMinutes(m); setSeconds(s);
      if (d > 0) setTimeLeft(`${d}${t("countdown.days")} ${h}${t("countdown.hours")} ${m}${t("countdown.minutes")}`);
      else if (h > 0) setTimeLeft(`${h}${t("countdown.hours")} ${m}${t("countdown.minutes")} ${s}${t("countdown.seconds")}`);
      else if (m > 0) setTimeLeft(`${m}${t("countdown.minutes")} ${s}${t("countdown.seconds")}`);
      else setTimeLeft(`${s}${t("countdown.seconds")}`);
    };
    calc();
    const interval = setInterval(calc, 1_000);
    return () => clearInterval(interval);
  }, [targetDate, t]);

  const currentLabel = isNewCycle ? t("countdown.nextSession") : defaultLabel;

  if (variant === "hero") {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`} role="timer" aria-live="polite" aria-label={`${currentLabel} ${timeLeft}`}>
        <div className="flex items-center gap-2 text-sm font-medium opacity-80">
          {isNewCycle ? <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} /> : <Clock className="h-3.5 w-3.5" />}
          <span>{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <TimeBlock value={days} unit={t("countdown.days")} />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={hours} unit={t("countdown.hours")} />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={minutes} unit={t("countdown.minutes")} />
          <span className="text-lg font-bold opacity-40">:</span>
          <TimeBlock value={seconds} unit={t("countdown.seconds")} />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${className}`} role="timer" aria-live="polite" aria-label={`${currentLabel} ${timeLeft}`}>
      {isNewCycle ? <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{currentLabel} <strong>{timeLeft}</strong></span>
    </div>
  );
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">{unit}</span>
    </div>
  );
}
