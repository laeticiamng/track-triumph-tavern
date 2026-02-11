import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

interface ScoringCriterion {
  criterion: string;
  weight: number;
}

function getWeights(criteria: ScoringCriterion[] | null): { emotion: number; originality: number; production: number } {
  const defaults = { emotion: 33, originality: 34, production: 33 };
  if (!criteria || !Array.isArray(criteria)) return defaults;
  const weights = { ...defaults };
  for (const c of criteria) {
    const key = c.criterion?.toLowerCase() || "";
    if (key.includes("émotion") || key.includes("emotion")) weights.emotion = c.weight;
    else if (key.includes("originalité") || key.includes("originality")) weights.originality = c.weight;
    else if (key.includes("production")) weights.production = c.weight;
  }
  return weights;
}

function computeWeightedScore(
  vote: { emotion_score: number | null; originality_score: number | null; production_score: number | null },
  weights: { emotion: number; originality: number; production: number }
): number {
  const e = vote.emotion_score ?? 3;
  const o = vote.originality_score ?? 3;
  const p = vote.production_score ?? 3;
  const total = weights.emotion + weights.originality + weights.production;
  if (total === 0) return (e + o + p) / 3;
  return (e * weights.emotion + o * weights.originality + p * weights.production) / total;
}

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

    // Load categories with scoring criteria
    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("id, scoring_criteria");

    const criteriaMap: Record<string, any> = {};
    for (const cat of categories || []) {
      criteriaMap[cat.id] = getWeights(cat.scoring_criteria as ScoringCriterion[] | null);
    }

    // Get all valid votes with scores
    const { data: votes, error: votesErr } = await supabaseAdmin
      .from("votes")
      .select("submission_id, category_id, emotion_score, originality_score, production_score")
      .eq("week_id", week_id)
      .eq("is_valid", true);

    if (votesErr) {
      console.error("Error fetching votes:", votesErr);
      return new Response(JSON.stringify({ error: "Erreur récupération votes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compute weighted score per submission
    const scoreAcc: Record<string, { total: number; count: number }> = {};
    for (const v of votes || []) {
      const weights = criteriaMap[v.category_id] || { emotion: 33, originality: 34, production: 33 };
      const score = computeWeightedScore(v, weights);
      if (!scoreAcc[v.submission_id]) scoreAcc[v.submission_id] = { total: 0, count: 0 };
      scoreAcc[v.submission_id].total += score;
      scoreAcc[v.submission_id].count += 1;
    }

    // Update vote_count (still useful for display) based on number of votes
    const updates = Object.entries(scoreAcc).map(([subId, { count }]) =>
      supabaseAdmin.from("submissions").update({ vote_count: count }).eq("id", subId)
    );
    await Promise.all(updates);

    // Publish results
    await supabaseAdmin
      .from("weeks")
      .update({ results_published_at: new Date().toISOString() })
      .eq("id", week_id);

    console.log(`Results computed for week ${week_id}: ${Object.keys(scoreAcc).length} submissions scored with weighted criteria`);

    return new Response(
      JSON.stringify({ success: true, submissions_scored: Object.keys(scoreAcc).length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("compute-results error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
