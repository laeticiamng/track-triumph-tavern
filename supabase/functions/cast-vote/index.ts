import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const PRODUCT_IDS = {
  pro: "prod_TvnnCLdThflvd5",
  elite: "prod_Tvnn1RBP7qVms7",
};

const FREE_VOTE_LIMIT = 5;
const PRO_COMMENT_LIMIT = 5;

async function getUserTier(email: string): Promise<"free" | "pro" | "elite"> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return "free";

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return "free";

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });
    if (subs.data.length === 0) return "free";

    const productId = subs.data[0].items.data[0]?.price?.product;
    if (productId === PRODUCT_IDS.elite) return "elite";
    if (productId === PRODUCT_IDS.pro) return "pro";
    return "free";
  } catch (err) {
    console.error("Stripe tier check error:", err);
    return "free";
  }
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

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Email verification check ──
    if (!user.email_confirmed_at) {
      return new Response(JSON.stringify({ error: "Veuillez confirmer votre email avant de voter." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { submission_id, originality_score, production_score, emotion_score } = body;
    let comment: string | undefined = body.comment;

    if (!submission_id) {
      return new Response(JSON.stringify({ error: "submission_id requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate optional scores (1-5)
    for (const [name, val] of Object.entries({ originality_score, production_score, emotion_score })) {
      if (val !== undefined && val !== null && (typeof val !== "number" || val < 1 || val > 5)) {
        return new Response(JSON.stringify({ error: `${name} doit être entre 1 et 5` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get submission details
    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, category_id, week_id, user_id, status")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) {
      return new Response(JSON.stringify({ error: "Soumission introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (submission.status !== "approved") {
      return new Response(JSON.stringify({ error: "Soumission non approuvée" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (submission.user_id === user.id) {
      return new Response(JSON.stringify({ error: "Vous ne pouvez pas voter pour votre propre soumission" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check voting period
    const { data: week } = await supabaseAdmin
      .from("weeks")
      .select("*")
      .eq("id", submission.week_id)
      .single();

    if (!week) {
      return new Response(JSON.stringify({ error: "Semaine introuvable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const votingOpen = new Date(week.voting_open_at);
    const votingClose = new Date(week.voting_close_at);

    if (now < votingOpen || now > votingClose) {
      return new Response(JSON.stringify({ error: "La période de vote n'est pas active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check 1 vote per user per category per week
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("id")
      .eq("user_id", user.id)
      .eq("category_id", submission.category_id)
      .eq("week_id", submission.week_id)
      .maybeSingle();

    if (existingVote) {
      return new Response(JSON.stringify({ error: "Vous avez déjà voté dans cette catégorie cette semaine" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: max 50 votes per hour per user
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count: hourlyVotes } = await supabaseAdmin
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((hourlyVotes || 0) >= 50) {
      return new Response(JSON.stringify({ error: "Limite de 50 votes par heure atteinte. Réessayez plus tard." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Burst protection: max 5 votes per minute
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: burstCount } = await supabaseAdmin
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo);

    if ((burstCount || 0) >= 5) {
      return new Response(JSON.stringify({ error: "Trop de votes en peu de temps. Réessayez dans un instant." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // FREE TIER: weekly vote quota (5 votes/week)
    const tier = await getUserTier(user.email!);
    console.log(`User tier: ${tier} (${user.email})`);

    if (tier === "free") {
      const { count: weeklyVotes } = await supabaseAdmin
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("week_id", submission.week_id);

      if ((weeklyVotes || 0) >= FREE_VOTE_LIMIT) {
        return new Response(JSON.stringify({
          error: "Limite de 5 votes par semaine atteinte. Passez à Pro pour des votes illimités.",
          votes_remaining: 0,
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // PRO TIER: weekly comment quota (5 comments/week)
    if (tier === "pro" && comment?.trim()) {
      const { count: weeklyComments } = await supabaseAdmin
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("week_id", submission.week_id)
        .not("comment", "is", null);

      if ((weeklyComments || 0) >= PRO_COMMENT_LIMIT) {
        console.log(`Pro user ${user.id} reached comment limit (${PRO_COMMENT_LIMIT}/week), stripping comment`);
        comment = undefined;
      }
    }

    // FREE TIER: no comments allowed
    if (tier === "free" && comment?.trim()) {
      comment = undefined;
    }

    // ── Build fraud metadata signals ──
    const userAgent = req.headers.get("user-agent") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const accountCreatedAt = user.created_at ? new Date(user.created_at) : null;
    const accountAgeMinutes = accountCreatedAt
      ? Math.floor((Date.now() - accountCreatedAt.getTime()) / 60_000)
      : null;

    const metadata: Record<string, unknown> = {};
    if (accountAgeMinutes !== null && accountAgeMinutes < 60) {
      metadata.is_new_account = true;
      metadata.account_age_minutes = accountAgeMinutes;
    }

    // ── AI fraud scoring (blocking — checked before vote insertion) ──
    let aiBlocked = false;
    let aiFraudResult: Record<string, unknown> | null = null;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        const { count: totalUserVotes } = await supabaseAdmin
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const twoMinAgo = new Date(Date.now() - 120_000).toISOString();
        const { count: burstVotes } = await supabaseAdmin
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", twoMinAgo);

        const signals = {
          account_age_minutes: accountAgeMinutes,
          user_agent: userAgent,
          ip_address: ip,
          burst_votes_2min: burstVotes || 0,
          total_votes: totalUserVotes || 0,
          tier,
          email_domain: user.email?.split("@")[1] || "unknown",
        };

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `Tu es un système anti-fraude pour une plateforme de vote musical. Analyse les signaux et retourne UNIQUEMENT un JSON: {"risk_score": 0-100, "flags": ["flag1"], "action": "allow"|"flag"|"block"}. Règles: compte <30min = suspect, >3 votes en 2min = suspect, user-agent vide/bot = suspect. Score >70 = block, 40-70 = flag, <40 = allow.`,
              },
              {
                role: "user",
                content: JSON.stringify(signals),
              },
            ],
            temperature: 0.1,
            max_tokens: 200,
          }),
        });

        if (aiResp.ok) {
          const aiResult = await aiResp.json();
          const content = aiResult.choices?.[0]?.message?.content || "";
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          try {
            aiFraudResult = JSON.parse(cleaned);
          } catch {
            console.error("AI fraud parse error:", cleaned);
          }

          if (aiFraudResult && (aiFraudResult as { action?: string; risk_score?: number }).action === "block" && ((aiFraudResult as { risk_score?: number }).risk_score ?? 0) >= 70) {
            aiBlocked = true;
          }
        }
      } catch (err) {
        console.error("AI fraud check error:", err);
        // Fail-open: allow the vote if AI is unreachable
      }
    }

    if (aiBlocked) {
      console.log(`Vote blocked by AI fraud detection for user=${user.id}`);
      return new Response(JSON.stringify({ error: "Vote refusé par notre système anti-fraude." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabaseAdmin
      .from("votes")
      .insert({
        user_id: user.id,
        submission_id: submission.id,
        category_id: submission.category_id,
        week_id: submission.week_id,
        originality_score: originality_score ?? null,
        production_score: production_score ?? null,
        emotion_score: emotion_score ?? null,
        comment: comment?.trim() || null,
        is_valid: true,
      })
      .select("id")
      .single();

    if (voteError) {
      console.error("Vote insert error:", voteError);
      return new Response(JSON.stringify({ error: "Erreur lors du vote" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert audit event with AI result
    if (aiFraudResult) {
      metadata.ai_fraud = aiFraudResult;
    }
    await supabaseAdmin.from("vote_events").insert({
      vote_id: vote.id,
      user_id: user.id,
      event_type: "cast",
      user_agent: userAgent,
      ip_address: ip,
      metadata,
    });

    // Increment vote_count on submission
    await supabaseAdmin.rpc("increment_vote_count", { _submission_id: submission.id }).catch(() => {
      return supabaseAdmin
        .from("submissions")
        .update({ vote_count: supabaseAdmin.rpc ? undefined : undefined })
        .eq("id", submission.id);
    });

    console.log(`Vote cast: user=${user.id}, submission=${submission.id}, tier=${tier}`);

    return new Response(
      JSON.stringify({ success: true, vote_id: vote.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cast-vote error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
