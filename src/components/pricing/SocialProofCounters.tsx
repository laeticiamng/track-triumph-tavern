import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Vote, Trophy } from "lucide-react";

interface Counts {
  artists: number;
  votes: number;
  winners: number;
}

export function SocialProofCounters() {
  const { t, i18n } = useTranslation();
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

  if (!counts) return null;

  const locale = i18n.language === "de" ? "de-DE" : i18n.language === "en" ? "en-US" : "fr-FR";

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: counts.artists, label: t("pricing.socialProofArtists") },
    { icon: <Vote className="h-5 w-5" />, value: counts.votes, label: t("pricing.socialProofVotes") },
    { icon: <Trophy className="h-5 w-5" />, value: counts.winners, label: t("pricing.socialProofWinners") },
  ].filter((s) => s.value > 0);

  if (stats.length === 0) return null;

  return (
    <section className="pb-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`grid gap-4 ${stats.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : stats.length === 2 ? "grid-cols-2 max-w-lg mx-auto" : "grid-cols-3"}`}
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
                {s.value.toLocaleString(locale)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
