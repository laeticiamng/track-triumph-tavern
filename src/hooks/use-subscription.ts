import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { SubscriptionTier } from "@/lib/subscription-tiers";

interface SubscriptionState {
  tier: SubscriptionTier;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: "free",
    subscribed: false,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setState({ tier: "free", subscribed: false, subscriptionEnd: null, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      const result = typeof data === "string" ? JSON.parse(data) : data;

      setState({
        tier: result.tier || "free",
        subscribed: result.subscribed || false,
        subscriptionEnd: result.subscription_end || null,
        loading: false,
      });
    } catch (err) {
      console.error("check-subscription error:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return { ...state, refresh: checkSubscription };
}
