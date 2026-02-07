const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function checkTier(authHeader: string): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const resp = await fetch(`${supabaseUrl}/functions/v1/check-subscription`, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      apikey: supabaseKey,
    },
  });
  
  if (!resp.ok) return "free";
  const data = await resp.json();
  return data.tier || "free";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth + tier check (Elite only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tier = await checkTier(authHeader);
    if (tier !== "elite") {
      return new Response(JSON.stringify({ error: "Le feedback IA est réservé aux abonnés Elite." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { title, artist_name, description, tags, category } = body;

    if (!title || !artist_name) {
      return new Response(JSON.stringify({ error: "title and artist_name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Tu es un expert en musique et en feedback constructif pour artistes émergents. Analyse cette soumission musicale et donne un feedback structuré en français.

Titre: ${title}
Artiste: ${artist_name}
Catégorie: ${category || "Non spécifiée"}
Description: ${description || "Aucune"}
Tags: ${tags?.join(", ") || "Aucun"}

Donne un feedback structuré avec exactement ces 4 sections (en JSON):
1. "vibe" - L'ambiance générale et le positionnement artistique (2-3 phrases)
2. "structure" - Commentaires sur la structure et l'arrangement (2-3 phrases)  
3. "production" - Qualité de production et mix (2-3 phrases)
4. "suggestions" - 3 suggestions concrètes d'amélioration (array de strings)

Réponds UNIQUEMENT en JSON valide, sans markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un expert musical. Réponds toujours en JSON valide uniquement." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let feedback;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      feedback = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      feedback = {
        vibe: content.substring(0, 200),
        structure: "Analyse en cours...",
        production: "Analyse en cours...",
        suggestions: ["Continuez à créer et expérimenter"],
      };
    }

    console.log(`AI feedback generated for: ${title} by ${artist_name}`);

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-feedback error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
