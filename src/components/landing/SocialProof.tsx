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
    { icon: Users, labelKey: "socialProof.registeredArtists", value: 0, color: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
    { icon: Heart, labelKey: "socialProof.recordedVotes", value: 0, color: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
    { icon: Music, labelKey: "socialProof.submittedTracks", value: 0, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
  ]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("weeks").select("voting_close_at").eq("is_active", true).maybeSingle(),
    ]).then(async ([profiles, submissionsCount, activeWeek]) => {
      const votingCloseAt = activeWeek.data?.voting_close_at;
      const votingOpen = votingCloseAt ? new Date(votingCloseAt) > new Date() : false;
      const trackCount = submissionsCount.count || 0;

      // Only fetch vote totals when voting is closed (avoids leaking data in network)
      let totalVotes = 0;
      if (!votingOpen) {
        const { data: subs } = await supabase
          .from("submissions_public")
          .select("vote_count")
          .eq("status", "approved");
        totalVotes = (subs || []).reduce((sum, s) => sum + (s.vote_count || 0), 0);
      }

      const displayStats: Stat[] = [
        { icon: Users, labelKey: "socialProof.registeredArtists", value: profiles.count || 0, color: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
        { icon: Music, labelKey: "socialProof.submittedTracks", value: trackCount, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
      ];
      // Only show votes stat when voting is closed and there are votes
      if (!votingOpen && totalVotes > 0) {
        displayStats.splice(1, 0, { icon: Heart, labelKey: "socialProof.recordedVotes", value: totalVotes, color: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" });
      }
      setStats(displayStats);
    }).catch(() => {});
  }, []);

  const hasData = stats.some((s) => s.value > 0);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="section-divider mb-24" />
      <div className="container relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-4">
            <TrendingUp className="h-3 w-3" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="card-elevated group flex flex-col items-center p-8 text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5" />
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
