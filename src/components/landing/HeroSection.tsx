import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function HeroSection() {
  const [weekLabel, setWeekLabel] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("weeks")
      .select("title, week_number, season_id, seasons(name)")
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) {
          const season = (data as any).seasons?.name || "Saison 1";
          const title = data.title || `Semaine ${data.week_number}`;
          setWeekLabel(`${season} — ${title} ouverte`);
        }
      });
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-primary-glow/15 blur-[80px]" />
      </div>

      <div className="container relative z-10 flex min-h-[85vh] flex-col items-center justify-center text-center">
        {weekLabel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              🎵 {weekLabel}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Votre talent mérite{" "}
          <span className="italic">d'être entendu</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-xl text-base text-primary-foreground/70 sm:text-lg"
        >
          Concours musical hebdomadaire. Soumettez votre musique, 
          recevez des votes de la communauté et montez sur le podium.
        </motion.p>

        {/* FREE participation badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80"
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Participation 100% gratuite
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Aucun frais d'entrée
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Récompenses sponsorisées
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-semibold px-8 text-base"
            asChild
          >
            <Link to="/auth?tab=signup">
              Participer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link to="/explore">Découvrir les artistes</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-xs text-primary-foreground/50"
        >
          Concours artistique basé sur le mérite — aucun paiement n'influence le classement
        </motion.p>
      </div>
    </section>
  );
}
