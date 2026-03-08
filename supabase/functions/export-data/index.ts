import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[EXPORT-DATA] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const userId = user.id;
    logStep("User authenticated", { userId });

    // Fetch all user data in parallel
    const [
      profileRes,
      submissionsRes,
      votesRes,
      followersRes,
      followingRes,
      badgesRes,
      streakRes,
      activitiesRes,
      notificationsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("submissions").select("id, title, artist_name, description, tags, category_id, week_id, status, created_at, external_url").eq("user_id", userId),
      supabase.from("votes").select("id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, created_at").eq("user_id", userId),
      supabase.from("follows").select("following_id, created_at").eq("follower_id", userId),
      supabase.from("follows").select("follower_id, created_at").eq("following_id", userId),
      supabase.from("weekly_badges").select("badge_type, week_id, metadata, created_at").eq("user_id", userId),
      supabase.from("vote_streaks").select("current_streak, longest_streak, last_vote_week_number, updated_at").eq("user_id", userId).single(),
      supabase.from("activities").select("type, title, body, metadata, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("notifications").select("type, title, body, read_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
    ]);

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        user_id: userId,
        email: user.email,
        format: "GDPR Article 20 - Right to data portability",
      },
      profile: profileRes.data ? {
        display_name: profileRes.data.display_name,
        bio: profileRes.data.bio,
        avatar_url: profileRes.data.avatar_url,
        banner_url: profileRes.data.banner_url,
        social_links: profileRes.data.social_links,
        created_at: profileRes.data.created_at,
        updated_at: profileRes.data.updated_at,
      } : null,
      submissions: submissionsRes.data || [],
      votes: votesRes.data || [],
      followers: followersRes.data || [],
      following: followingRes.data || [],
      badges: badgesRes.data || [],
      vote_streak: streakRes.data || null,
      activities: activitiesRes.data || [],
      notifications: notificationsRes.data || [],
    };

    logStep("Export completed", {
      userId,
      submissions: exportData.submissions.length,
      votes: exportData.votes.length,
    });

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="wma-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
