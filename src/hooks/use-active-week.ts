import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useActiveWeek() {
  const [week, setWeek] = useState<Tables<"weeks"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("weeks")
      .select("*")
      .eq("is_active", true)
      .single()
      .then(({ data, error: err }) => {
        if (err && err.code !== "PGRST116") {
          setError("Impossible de charger la semaine active");
        }
        setWeek(data || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur réseau");
        setLoading(false);
      });
  }, []);

  return { week, loading, error };
}
