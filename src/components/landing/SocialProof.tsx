import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Music, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Stat {
  icon: React.ElementType;
  labelKey: string;
  value: number;
  color: string;
  iconBg: string;
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (value === 0 || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) { setDisplay(value); clearInterval(timer); }
            else { setDisplay(Math.round(current)); }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="mt-4 font-display text-4xl font-bold tabular-nums">
      {display.toLocaleString()}
    </span>
  );
}

export function SocialProof() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stat[]>([
    { icon: Users, labelKey: "socialProof.registeredArtists", value: 0, color: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/15" },
    { icon: Heart, labelKey: "socialProof.recordedVotes", value: 0, color: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/15" },
    { icon: Music, labelKey: "socialProof.submittedTracks", value: 0, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/15" },
  ]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
      supabase.from("submissions").select("id", { count: "exact", head: true }),
    ]).then(([profiles, votes, submissions]) => {
      setStats([
        { icon: Users, labelKey: "socialProof.registeredArtists", value: profiles.count || 0, color: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/15" },
        { icon: Heart, labelKey: "socialProof.recordedVotes", value: votes.count || 0, color: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/15" },
        { icon: Music, labelKey: "socialProof.submittedTracks", value: submissions.count || 0, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/15" },
      ]);
    }).catch(() => {});
  }, []);

  const hasData = stats.some((s) => s.value > 0);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-rose-500/5 blur-[100px]" />

      <div className="container relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-block rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-4">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {hasData ? t("socialProof.growing") : t("socialProof.launchSoon")}
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {hasData ? t("socialProof.communityNumbers") : t("socialProof.launchSoon")}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {hasData ? t("socialProof.joinGrowing") : t("socialProof.beFirst")}
          </p>
        </motion.div>

        {hasData ? (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="group flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <AnimatedCounter value={stat.value} />
                <span className="mt-1 text-sm text-muted-foreground">{t(stat.labelKey)}</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-10 flex flex-col items-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
              <Link to="/auth?tab=signup">
                {t("socialProof.joinContest")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
