import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Music, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Stat {
  icon: React.ElementType;
  label: string;
  value: number;
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
            if (current >= value) {
              setDisplay(value);
              clearInterval(timer);
            } else {
              setDisplay(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="mt-4 font-display text-4xl font-bold">
      {display.toLocaleString("fr-FR")}
    </span>
  );
}

export function SocialProof() {
  const [stats, setStats] = useState<Stat[]>([
    { icon: Users, label: "Artistes inscrits", value: 0 },
    { icon: Heart, label: "Votes enregistrés", value: 0 },
    { icon: Music, label: "Morceaux soumis", value: 0 },
  ]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
      supabase.from("submissions").select("id", { count: "exact", head: true }),
    ]).then(([profiles, votes, submissions]) => {
      setStats([
        { icon: Users, label: "Artistes inscrits", value: profiles.count || 0 },
        { icon: Heart, label: "Votes enregistrés", value: votes.count || 0 },
        { icon: Music, label: "Morceaux soumis", value: submissions.count || 0 },
      ]);
    });
  }, []);

  const hasData = stats.some((s) => s.value > 0);

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {hasData ? "La communauté en chiffres" : "Lancement imminent"}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {hasData
              ? "Rejoignez une communauté grandissante d'artistes et de passionnés."
              : "Soyez parmi les premiers à participer au concours. Les inscriptions sont ouvertes !"}
          </p>
        </motion.div>

        {hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <stat.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <AnimatedCounter value={stat.value} />
                <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 flex flex-col items-center"
          >
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
              <Link to="/auth?tab=signup">
                Rejoindre le concours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
