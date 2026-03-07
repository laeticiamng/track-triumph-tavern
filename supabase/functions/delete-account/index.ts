import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[DELETE-ACCOUNT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const userId = user.id;
    logStep("User authenticated", { userId });

    // Delete user data in order (respecting foreign keys)
    // 1. Delete votes & vote events
    const { data: votes } = await supabaseClient.from("votes").select("id").eq("user_id", userId);
    if (votes && votes.length > 0) {
      const voteIds = votes.map(v => v.id);
      await supabaseClient.from("vote_events").delete().in("vote_id", voteIds);
      await supabaseClient.from("votes").delete().eq("user_id", userId);
    }

    // 2. Delete submissions
    await supabaseClient.from("submissions").delete().eq("user_id", userId);

    // 3. Delete social data
    await supabaseClient.from("follows").delete().eq("follower_id", userId);
    await supabaseClient.from("follows").delete().eq("following_id", userId);
    await supabaseClient.from("activities").delete().eq("user_id", userId);
    await supabaseClient.from("notifications").delete().eq("user_id", userId);
    await supabaseClient.from("push_subscriptions").delete().eq("user_id", userId);

    // 4. Delete gamification data
    await supabaseClient.from("weekly_badges").delete().eq("user_id", userId);
    await supabaseClient.from("vote_streaks").delete().eq("user_id", userId);

    // 5. Delete analytics
    await supabaseClient.from("analytics_events").delete().eq("user_id", userId);

    // 6. Delete profile & role
    await supabaseClient.from("user_roles").delete().eq("user_id", userId);
    await supabaseClient.from("profiles").delete().eq("id", userId);

    // 7. Delete auth user
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);
    if (deleteError) throw new Error(`Failed to delete auth user: ${deleteError.message}`);

    logStep("Account deleted successfully", { userId });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
