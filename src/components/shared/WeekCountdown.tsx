import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface WeekCountdownProps {
  targetDate: string;
  label?: string;
  className?: string;
}

export function WeekCountdown({ targetDate, label = "Fin du vote dans", className = "" }: WeekCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Terminé");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      if (days > 0) {
        setTimeLeft(`${days}j ${hours}h ${minutes}min`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}min`);
      } else {
        setTimeLeft(`${minutes}min`);
      }
    };

    calc();
    const interval = setInterval(calc, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      <span>{label} <strong>{timeLeft}</strong></span>
    </div>
  );
}
