import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tier check - Pro or Elite
    const tier = await checkTier(authHeader);
    if (tier !== "pro" && tier !== "elite") {
      return new Response(JSON.stringify({ error: "Le résumé IA est réservé aux abonnés Pro et Elite." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: submissions } = await supabase
      .from("submissions")
      .select("id, title, artist_name, vote_count, category_id")
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (!submissions || submissions.length === 0) {
      return new Response(JSON.stringify({
        summary: {
          strengths: "Vous n'avez pas encore de soumissions approuvées. Soumettez un morceau pour recevoir des retours !",
          improvements: "",
          overall: "En attente de données.",
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subIds = submissions.map((s) => s.id);

    const { data: votes } = await supabase
      .from("votes")
      .select("originality_score, production_score, emotion_score, comment, submission_id")
      .in("submission_id", subIds);

    if (!votes || votes.length === 0) {
      return new Response(JSON.stringify({
        summary: {
          strengths: "Vos morceaux n'ont pas encore reçu de votes. Partagez-les pour obtenir des retours !",
          improvements: "",
          overall: "En attente de votes.",
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const comments = votes.filter((v) => v.comment).map((v) => String(v.comment).slice(0, 300).replace(/[\r\n|]/g, " ")).slice(0, 20);
    const avgScores = {
      originality: votes.filter((v) => v.originality_score).reduce((s, v) => s + (v.originality_score || 0), 0) / (votes.filter((v) => v.originality_score).length || 1),
      production: votes.filter((v) => v.production_score).reduce((s, v) => s + (v.production_score || 0), 0) / (votes.filter((v) => v.production_score).length || 1),
      emotion: votes.filter((v) => v.emotion_score).reduce((s, v) => s + (v.emotion_score || 0), 0) / (votes.filter((v) => v.emotion_score).length || 1),
    };

    const prompt = `Tu es un coach musical bienveillant. Analyse les retours reçus par cet artiste et fais un résumé constructif en français.

Données:
- ${submissions.length} soumission(s), ${votes.length} vote(s) total
- Scores moyens: Originalité ${avgScores.originality.toFixed(1)}/5, Production ${avgScores.production.toFixed(1)}/5, Émotion ${avgScores.emotion.toFixed(1)}/5
- Commentaires reçus: ${comments.length > 0 ? comments.join(" | ") : "Aucun commentaire"}

Réponds en JSON avec ces 3 champs:
1. "strengths" - Points forts identifiés (2-3 phrases)
2. "improvements" - Axes d'amélioration (2-3 phrases)
3. "overall" - Résumé global encourageant (1-2 phrases)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un coach musical. Réponds en JSON valide uniquement." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let summary;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summary = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI summary:", content);
      summary = { strengths: content.substring(0, 200), improvements: "", overall: "" };
    }

    console.log(`AI vote summary generated for user: ${user.id}`);

    return new Response(JSON.stringify({ summary, stats: { totalVotes: votes.length, avgScores } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-vote-summary error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
