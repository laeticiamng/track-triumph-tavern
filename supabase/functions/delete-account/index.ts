import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("delete-account");
const logStep = (step: string, details?: Record<string, unknown>) => {
  log.info(step, details);
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

    // Delete all user data atomically in a single DB transaction
    const { error: rpcError } = await supabaseClient.rpc("delete_user_data", {
      _user_id: userId,
    });
    if (rpcError) throw new Error(`Failed to delete user data: ${rpcError.message}`);

    logStep("User data deleted", { userId });

    // Delete auth user (requires admin API, cannot be done inside the RPC)
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
