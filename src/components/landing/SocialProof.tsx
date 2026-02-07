import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Music } from "lucide-react";

interface Stat {
  icon: React.ElementType;
  label: string;
  value: number;
}

export function SocialProof() {
  const [stats, setStats] = useState<Stat[]>([
    { icon: Users, label: "Artistes inscrits", value: 0 },
    { icon: Heart, label: "Votes cette semaine", value: 0 },
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
              <span className="mt-4 font-display text-4xl font-bold">
                {stat.value.toLocaleString("fr-FR")}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
