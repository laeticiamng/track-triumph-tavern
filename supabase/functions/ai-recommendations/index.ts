import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { week_id } = await req.json();
    if (!week_id) {
      return new Response(JSON.stringify({ error: "week_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's voting history (categories and tags they liked)
    const { data: userVotes } = await supabase
      .from("votes")
      .select("submission_id, category_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get voted submissions details for tag patterns
    const votedSubIds = userVotes?.map((v) => v.submission_id) || [];
    let votedTags: string[] = [];
    let preferredCategories: string[] = [];

    if (votedSubIds.length > 0) {
      const { data: votedSubs } = await supabase
        .from("submissions")
        .select("tags, category_id")
        .in("id", votedSubIds);

      votedTags = (votedSubs || []).flatMap((s) => s.tags || []);
      preferredCategories = (votedSubs || []).map((s) => s.category_id);
    }

    // Get current week's submissions the user hasn't voted on
    const { data: available } = await supabase
      .from("submissions")
      .select("id, title, artist_name, tags, category_id")
      .eq("week_id", week_id)
      .eq("status", "approved")
      .neq("user_id", user.id);

    if (!available || available.length === 0) {
      return new Response(JSON.stringify({ recommended_ids: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out already voted
    const votedSet = new Set(votedSubIds);
    const unvoted = available.filter((s) => !votedSet.has(s.id));

    if (unvoted.length === 0) {
      return new Response(JSON.stringify({ recommended_ids: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no voting history, return random 3
    if (votedSubIds.length === 0) {
      const shuffled = unvoted.sort(() => Math.random() - 0.5).slice(0, 3);
      return new Response(JSON.stringify({ recommended_ids: shuffled.map((s) => s.id) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to rank
    const tagFreq = new Map<string, number>();
    votedTags.forEach((t) => tagFreq.set(t, (tagFreq.get(t) || 0) + 1));
    const topTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);

    const catFreq = new Map<string, number>();
    preferredCategories.forEach((c) => catFreq.set(c, (catFreq.get(c) || 0) + 1));

    const prompt = `Tu es un système de recommandation musicale. L'utilisateur a ces préférences:
Tags préférés: ${topTags.join(", ") || "aucun"}
Nombre de votes passés: ${votedSubIds.length}

Voici les morceaux disponibles (ID | Titre | Tags):
${unvoted.map((s) => `${s.id} | ${s.title} | ${(s.tags || []).join(", ")}`).join("\n")}

Classe les 3 morceaux les plus susceptibles de plaire à cet utilisateur. Réponds UNIQUEMENT en JSON: {"ids": ["id1", "id2", "id3"]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un moteur de recommandation. Réponds en JSON valide uniquement." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        // Fallback: simple scoring without AI
        const scored = unvoted.map((s) => {
          let score = 0;
          (s.tags || []).forEach((t) => { if (topTags.includes(t)) score += 2; });
          if (catFreq.has(s.category_id)) score += catFreq.get(s.category_id)!;
          return { ...s, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return new Response(JSON.stringify({ recommended_ids: scored.slice(0, 3).map((s) => s.id) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      // Fallback random
      const shuffled = unvoted.sort(() => Math.random() - 0.5).slice(0, 3);
      return new Response(JSON.stringify({ recommended_ids: shuffled.map((s) => s.id) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let recommendedIds: string[] = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      recommendedIds = (parsed.ids || []).filter((id: string) => unvoted.some((s) => s.id === id)).slice(0, 3);
    } catch {
      console.error("Failed to parse AI recommendations:", content);
      recommendedIds = unvoted.sort(() => Math.random() - 0.5).slice(0, 3).map((s) => s.id);
    }

    console.log(`AI recommendations for user ${user.id}: [${recommendedIds.join(", ")}]`);

    return new Response(JSON.stringify({ recommended_ids: recommendedIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-recommendations error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
