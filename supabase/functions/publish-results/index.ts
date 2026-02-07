import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
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

    // Check admin
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

    if (!roles?.some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { week_id } = await req.json();
    if (!week_id) {
      return new Response(JSON.stringify({ error: "week_id requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[publish-results] Starting for week ${week_id}`);

    // Load reward pool
    const { data: pool } = await supabaseAdmin
      .from("reward_pools")
      .select("*")
      .eq("week_id", week_id)
      .maybeSingle();

    const isCashMode = pool && (pool.status === "active" || pool.status === "locked" || pool.status === "threshold_met");
    console.log(`[publish-results] Pool status: ${pool?.status || "none"}, cash mode: ${isCashMode}`);

    // Load categories
    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("id")
      .order("sort_order");

    // Get valid votes for the week
    const { data: votes, error: votesErr } = await supabaseAdmin
      .from("votes")
      .select("submission_id")
      .eq("week_id", week_id)
      .eq("is_valid", true);

    if (votesErr) {
      console.error("[publish-results] Error fetching votes:", votesErr);
      return new Response(JSON.stringify({ error: "Erreur récupération votes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count votes per submission
    const voteCounts: Record<string, number> = {};
    for (const v of votes || []) {
      voteCounts[v.submission_id] = (voteCounts[v.submission_id] || 0) + 1;
    }

    // Update each submission's vote_count
    const updates = Object.entries(voteCounts).map(([subId, count]) =>
      supabaseAdmin.from("submissions").update({ vote_count: count }).eq("id", subId)
    );
    await Promise.all(updates);

    // Delete existing winners for this week (idempotent re-publish)
    await supabaseAdmin.from("winners").delete().eq("week_id", week_id);

    // Get approved submissions for this week
    const { data: allSubs } = await supabaseAdmin
      .from("submissions")
      .select("id, user_id, category_id, vote_count")
      .eq("week_id", week_id)
      .eq("status", "approved")
      .order("vote_count", { ascending: false });

    let winnersCount = 0;
    const amountsByRank = pool
      ? { 1: pool.top1_amount_cents, 2: pool.top2_amount_cents, 3: pool.top3_amount_cents }
      : { 1: 0, 2: 0, 3: 0 };

    for (const cat of categories || []) {
      const catSubs = (allSubs || []).filter((s: any) => s.category_id === cat.id);
      const top3 = catSubs.slice(0, 3);

      for (let i = 0; i < top3.length; i++) {
        const sub = top3[i];
        const rank = i + 1;

        // Insert winner
        const { data: winner, error: winErr } = await supabaseAdmin
          .from("winners")
          .insert({
            week_id,
            category_id: cat.id,
            submission_id: sub.id,
            user_id: sub.user_id,
            rank,
            vote_count: sub.vote_count || 0,
          })
          .select("id")
          .single();

        if (winErr) {
          console.error(`[publish-results] Error inserting winner rank ${rank}:`, winErr);
          continue;
        }

        // Insert reward
        const rewardData: any = {
          winner_id: winner.id,
          week_id,
          reward_type: isCashMode ? "cash" : "fallback",
          amount_cents: isCashMode ? (amountsByRank as any)[rank] || 0 : 0,
          label: isCashMode ? null : (pool?.fallback_label || "Récompenses alternatives disponibles"),
          status: "pending",
        };

        const { error: rewErr } = await supabaseAdmin.from("rewards").insert(rewardData);
        if (rewErr) {
          console.error(`[publish-results] Error inserting reward:`, rewErr);
        }

        winnersCount++;
      }
    }

    // Publish results
    await supabaseAdmin
      .from("weeks")
      .update({ results_published_at: new Date().toISOString() })
      .eq("id", week_id);

    // Lock pool if cash mode
    if (isCashMode && pool) {
      await supabaseAdmin
        .from("reward_pools")
        .update({ status: "locked" })
        .eq("id", pool.id);
    }

    console.log(`[publish-results] Done: ${winnersCount} winners, mode: ${isCashMode ? "cash" : "fallback"}`);

    return new Response(
      JSON.stringify({
        success: true,
        winners_count: winnersCount,
        reward_mode: isCashMode ? "cash" : "fallback",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[publish-results] error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
