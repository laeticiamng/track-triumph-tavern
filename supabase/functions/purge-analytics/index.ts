import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
