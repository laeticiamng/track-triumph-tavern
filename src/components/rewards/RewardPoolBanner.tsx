import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Gift, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export function RewardPoolBanner() {
  const [pool, setPool] = useState<Tables<"reward_pools"> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: week } = await supabase.from("weeks").select("id").eq("is_active", true).single();
      if (!week) return;
      const { data } = await supabase.from("reward_pools").select("*").eq("week_id", week.id).single();
      if (data) setPool(data);
    };
    load();
  }, []);

  if (!pool) return null;

  const isActive = pool.status === "active" || pool.status === "threshold_met" || pool.status === "locked";
  const totalPrize = (pool.top1_amount_cents + pool.top2_amount_cents + pool.top3_amount_cents) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`overflow-hidden ${isActive ? "border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10" : "border-border"}`}>
        <CardContent className="flex items-center gap-4 py-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {isActive ? <Trophy className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold">Cagnotte de la semaine</p>
              <Badge className={isActive ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}>
                {isActive ? "ACTIVE" : "EN ATTENTE"}
              </Badge>
            </div>
            {isActive ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalPrize}€</span> en prix — 
                🥇 {pool.top1_amount_cents / 100}€ · 🥈 {pool.top2_amount_cents / 100}€ · 🥉 {pool.top3_amount_cents / 100}€
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {pool.fallback_label || "Récompenses alternatives : visibilité, coaching, badges"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
