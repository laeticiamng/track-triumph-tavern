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

    // Check admin role
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

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
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

    // Get all valid votes for the week
    const { data: votes, error: votesErr } = await supabaseAdmin
      .from("votes")
      .select("submission_id")
      .eq("week_id", week_id)
      .eq("is_valid", true);

    if (votesErr) {
      console.error("Error fetching votes:", votesErr);
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
      supabaseAdmin
        .from("submissions")
        .update({ vote_count: count })
        .eq("id", subId)
    );

    await Promise.all(updates);

    // Publish results: set results_published_at
    await supabaseAdmin
      .from("weeks")
      .update({ results_published_at: new Date().toISOString() })
      .eq("id", week_id);

    console.log(`Results computed for week ${week_id}: ${Object.keys(voteCounts).length} submissions scored`);

    return new Response(
      JSON.stringify({ success: true, submissions_scored: Object.keys(voteCounts).length }),
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
