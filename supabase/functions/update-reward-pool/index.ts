import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = roles?.some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, week_id, ...params } = body;

    if (action === "update_pool") {
      const { current_cents, minimum_cents, sponsors, top1_amount_cents, top2_amount_cents, top3_amount_cents, fallback_label } = params;

      // Determine status
      let status = "inactive";
      if (minimum_cents > 0 && current_cents >= minimum_cents) {
        status = "active";
      } else if (minimum_cents > 0 && current_cents >= minimum_cents * 0.5) {
        status = "threshold_met";
      }

      const { data, error } = await supabaseAdmin
        .from("reward_pools")
        .upsert({
          week_id,
          current_cents: current_cents || 0,
          minimum_cents: minimum_cents || 0,
          sponsors: sponsors || [],
          top1_amount_cents: top1_amount_cents || 0,
          top2_amount_cents: top2_amount_cents || 0,
          top3_amount_cents: top3_amount_cents || 0,
          fallback_label: fallback_label || "Récompenses alternatives disponibles",
          status,
          updated_at: new Date().toISOString(),
        }, { onConflict: "week_id" })
        .select()
        .single();

      if (error) {
        console.error("update_pool error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Reward pool updated for week ${week_id}, status: ${status}`);
      return new Response(JSON.stringify({ success: true, pool: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Action inconnue" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("update-reward-pool error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
