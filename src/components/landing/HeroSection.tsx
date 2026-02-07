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

      <div className="container relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        {/* Beta badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-5"
        >
          <span className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            🚀 Lancement Bêta {weekLabel ? `— ${weekLabel}` : ""}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Soumettez votre musique.{" "}
          <span className="italic">La communauté vote.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 max-w-xl text-sm text-primary-foreground/70 sm:text-lg"
        >
          Montez sur le podium chaque semaine. Votez gratuitement, soumettez avec un abonnement Pro.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-primary-foreground/80"
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Vote gratuit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Basé sur le mérite
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            Récompenses chaque semaine
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="bg-primary-foreground text-background hover:bg-primary-foreground/90 font-semibold px-8 text-base"
            asChild
          >
            <Link to="/explore">
              Découvrir le concours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link to="/auth?tab=signup">Créer mon compte</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-xs text-primary-foreground/50"
        >
          Le classement est 100% méritocratique — aucun paiement n'influence les résultats
        </motion.p>
      </div>
    </section>
  );
}
