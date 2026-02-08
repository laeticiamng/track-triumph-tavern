import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useActiveWeek() {
  const [week, setWeek] = useState<Tables<"weeks"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("weeks")
      .select("*")
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        setWeek(data || null);
        setLoading(false);
      });
  }, []);

  return { week, loading };
}
