import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    // Require service role key or admin auth for this sensitive operation
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey
    );

    // If called with a bearer token, verify it's an admin
    if (authHeader && !authHeader.includes(serviceKey)) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: cors });
      }
    }

    // Delete analytics events older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const { count, error } = await supabase
      .from("analytics_events")
      .delete({ count: "exact" })
      .lt("created_at", cutoff.toISOString());

    if (error) throw error;

    // Also purge PII (IP/User-Agent) from vote_events older than 30 days
    const piiCutoff = new Date();
    piiCutoff.setDate(piiCutoff.getDate() - 30);

    const { count: piiPurged, error: piiError } = await supabase
      .from("vote_events")
      .update({ ip_address: null, user_agent: null })
      .lt("created_at", piiCutoff.toISOString())
      .not("ip_address", "is", null);

    if (piiError) console.error("PII purge error:", piiError);

    return new Response(
      JSON.stringify({
        analytics_purged: count,
        pii_purged: piiPurged || 0,
        analytics_cutoff: cutoff.toISOString(),
        pii_cutoff: piiCutoff.toISOString(),
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
