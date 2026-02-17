import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Headphones, Music, Mic2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WeekCountdown } from "@/components/shared/WeekCountdown";
import { supabase } from "@/integrations/supabase/client";

const floatingIcons = [
  { Icon: Music, size: "h-6 w-6", top: "12%", left: "8%", delay: 0, duration: 7 },
  { Icon: Headphones, size: "h-8 w-8", top: "20%", right: "10%", delay: 1, duration: 9 },
  { Icon: Mic2, size: "h-5 w-5", bottom: "30%", left: "12%", delay: 2, duration: 6 },
  { Icon: Music, size: "h-7 w-7", top: "60%", right: "8%", delay: 0.5, duration: 8 },
  { Icon: Headphones, size: "h-5 w-5", bottom: "15%", right: "20%", delay: 1.5, duration: 7 },
];

export function HeroSection() {
  const [weekLabel, setWeekLabel] = useState<string | null>(null);
  const [votingCloseAt, setVotingCloseAt] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState<boolean | null>(null);

  useEffect(() => {
    supabase
      .from("weeks")
      .select("title, week_number, season_id, voting_close_at, id, seasons(name)")
      .eq("is_active", true)
      .single()
      .then(async ({ data }) => {
        if (data) {
          const season = (data as { seasons?: { name: string } | null }).seasons?.name || "Saison 1";
          const title = data.title || `Semaine ${data.week_number}`;
          setWeekLabel(`${season} — ${title} ouverte`);
          setVotingCloseAt(data.voting_close_at);

          const { count } = await supabase
            .from("submissions")
            .select("id", { count: "exact", head: true })
            .eq("status", "approved")
            .eq("week_id", data.id);

          setHasContent((count || 0) > 0);
        } else {
          setHasContent(false);
        }
      }).catch(() => {});
  }, []);

  const primaryCTA = hasContent
    ? { label: "Découvrir le concours", href: "/explore" }
    : { label: "Rejoindre le concours", href: "/auth?tab=signup" };

  return (
    <section className="relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-pink-500/15 blur-[100px]"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[80px]"
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Floating music icons */}
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        {floatingIcons.map(({ Icon, size, delay, duration, ...pos }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={pos}
            animate={{
              y: [0, -20, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
          >
            <Icon className={size} />
          </motion.div>
        ))}
      </div>

      <div className="container relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Concours en cours {weekLabel ? `· ${weekLabel}` : ""}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Le concours musical{" "}
          <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
            hebdomadaire
          </span>{" "}
          où la communauté décide.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-xl text-base text-white/70 sm:text-lg"
        >
          Soumettez votre musique, recevez des votes de la communauté, et gagnez jusqu'à 200 € chaque semaine.
        </motion.p>

        {/* Trust badges - colored */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm"
        >
          {[
            { label: "Vote gratuit", color: "text-green-300" },
            { label: "Basé sur le mérite", color: "text-amber-300" },
            { label: "200 € par semaine", color: "text-pink-300" },
          ].map((badge) => (
            <span key={badge.label} className="inline-flex items-center gap-1.5 text-white/80">
              <CheckCircle className={`h-4 w-4 ${badge.color}`} />
              {badge.label}
            </span>
          ))}
        </motion.div>

        {/* Countdown - hero variant with glass card */}
        {votingCloseAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 backdrop-blur-sm"
          >
            <WeekCountdown
              targetDate={votingCloseAt}
              label="Fin du vote dans"
              variant="hero"
              className="text-white"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 text-base shadow-lg shadow-white/10"
            asChild
          >
            <Link to={primaryCTA.href}>
              {primaryCTA.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            asChild
          >
            <Link to={hasContent ? "/auth?tab=signup" : "/about"}>
              {hasContent ? "Créer mon compte" : "En savoir plus"}
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-5 text-xs text-white/40"
        >
          Le classement est 100 % méritocratique — aucun paiement n'influence les résultats
        </motion.p>
      </div>

      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
