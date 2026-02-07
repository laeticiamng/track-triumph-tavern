import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_IDS = {
  pro: "prod_TvnnCLdThflvd5",
  elite: "prod_Tvnn1RBP7qVms7",
};

const FREE_VOTE_LIMIT = 5;

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
    const { submission_id, originality_score, production_score, emotion_score, comment } = body;

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

    // Rate limiting: max 5 votes per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentVotes } = await supabaseAdmin
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo);

    if ((recentVotes || 0) >= 5) {
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

    // ── Build fraud metadata signals ──
    const metadata: Record<string, any> = {};

    // New account detection (< 1 hour)
    const accountCreatedAt = user.created_at ? new Date(user.created_at) : null;
    if (accountCreatedAt && (Date.now() - accountCreatedAt.getTime()) < 3_600_000) {
      metadata.is_new_account = true;
      metadata.account_age_minutes = Math.floor((Date.now() - accountCreatedAt.getTime()) / 60_000);
    }

    // Insert audit event with metadata
    const userAgent = req.headers.get("user-agent") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

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
        .update({ vote_count: (submission as any).vote_count + 1 })
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
