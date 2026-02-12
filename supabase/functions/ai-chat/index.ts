import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `Tu es l'assistant musical de SoundClash, une plateforme de compétition musicale hebdomadaire. Tu aides les artistes émergents avec :

- Le fonctionnement du concours (soumission, votes, résultats, classement)
- Des conseils de production musicale (mix, mastering, arrangement)
- Des tips de promotion et marketing musical
- Des retours sur leur stratégie artistique

Règles du concours:
- Soumission: 1 morceau par semaine (Pro/Elite uniquement)
- Votes: 5/semaine (Free), illimités (Pro/Elite)
- Commentaires: 0 (Free), 5/semaine (Pro), illimités (Elite)
- Feedback IA: Elite uniquement
- Les résultats sont publiés chaque semaine avec un classement par catégorie

Sois bienveillant, concis et encourage la créativité. Réponds en français. Limite tes réponses à 3-4 phrases maximum sauf si on te demande un détail.`;

async function checkTier(authHeader: string): Promise<{ tier: string; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const resp = await fetch(`${supabaseUrl}/functions/v1/check-subscription`, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      apikey: supabaseKey,
    },
  });
  
  if (!resp.ok) {
    return { tier: "free", error: "Impossible de vérifier l'abonnement" };
  }
  
  const data = await resp.json();
  return { tier: data.tier || "free" };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    // Auth + tier check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tier, error: tierError } = await checkTier(authHeader);
    if (tierError) {
      console.error("Tier check error:", tierError);
    }

    if (tier !== "pro" && tier !== "elite") {
      return new Response(JSON.stringify({ error: "Le chatbot IA est réservé aux abonnés Pro et Elite." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.content && lastMessage.content.length > 2000) {
      return new Response(JSON.stringify({ error: "Message trop long (max 2000 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("ai-chat error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
