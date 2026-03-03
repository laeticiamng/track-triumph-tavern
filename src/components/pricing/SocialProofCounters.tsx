import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Vote, Trophy } from "lucide-react";

interface Counts {
  artists: number;
  votes: number;
  winners: number;
}

export function SocialProofCounters() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    async function load() {
      const [profilesRes, votesRes, winnersRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("votes").select("id", { count: "exact", head: true }),
        supabase.from("winners").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        artists: profilesRes.count ?? 0,
        votes: votesRes.count ?? 0,
        winners: winnersRes.count ?? 0,
      });
    }
    load();
  }, []);

  if (!counts || (counts.artists === 0 && counts.votes === 0 && counts.winners === 0)) {
    return null;
  }

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: counts.artists, label: "artistes inscrits" },
    { icon: <Vote className="h-5 w-5" />, value: counts.votes, label: "votes exprimés" },
    { icon: <Trophy className="h-5 w-5" />, value: counts.winners, label: "gagnants récompensés" },
  ];

  return (
    <section className="pb-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                {s.icon}
              </div>
              <span className="font-display text-2xl font-bold">
                {s.value.toLocaleString("fr-FR")}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
