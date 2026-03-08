import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Notify artists when their submission status changes.
 * Called by the admin dashboard when approving/rejecting submissions.
 *
 * Body: { submission_id: string, new_status: "approved" | "rejected", reason?: string }
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Non authentifie" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return jsonResponse({ error: "Non authentifie" }, 401);

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return jsonResponse({ error: "Acces reserve aux administrateurs" }, 403);
    }

    const body = await req.json();
    const { submission_id, new_status, reason } = body;

    if (!submission_id || !new_status) {
      return jsonResponse({ error: "submission_id et new_status requis" }, 400);
    }

    if (!["approved", "rejected", "pending"].includes(new_status)) {
      return jsonResponse({ error: "Statut invalide" }, 400);
    }

    // Get submission details
    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, title, artist_name, user_id")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) {
      return jsonResponse({ error: "Soumission introuvable" }, 404);
    }

    // Build notification title/body based on status
    let notifTitle: string;
    let notifBody: string;

    const safeTitle = escapeHtml(submission.title);

    switch (new_status) {
      case "approved":
        notifTitle = `Morceau approuvé !`;
        notifBody = `Votre soumission "${safeTitle}" a été approuvée. Elle est maintenant visible par la communauté.`;
        break;
      case "rejected":
        notifTitle = `Soumission non retenue`;
        notifBody = reason
          ? `Votre soumission "${safeTitle}" n'a pas été approuvée. Motif : ${escapeHtml(reason)}`
          : `Votre soumission "${safeTitle}" n'a pas été approuvée cette fois-ci.`;
        break;
      default:
        notifTitle = `Soumission en attente`;
        notifBody = `Votre soumission "${safeTitle}" est en cours de modération.`;
        break;
    }

    // Store in-app notification (notifications table, not vote_events)
    await supabaseAdmin.from("notifications").insert({
      user_id: submission.user_id,
      type: `submission_${new_status}`,
      title: notifTitle,
      body: notifBody,
      metadata: {
        submission_id,
        track_title: submission.title,
        artist_name: submission.artist_name,
        reason: reason || null,
      },
    });

    // TODO: integrate a transactional email service (Resend, SendGrid, etc.)
    console.log(`[NOTIFY] ${new_status} — user: ${submission.user_id}, track: ${submission.title}`);

    return jsonResponse({
      success: true,
      notified: submission.user_id,
      status: new_status,
    });
  } catch (err) {
    console.error("notify-status-change error:", err);
    return jsonResponse({ error: "Erreur interne" }, 500);
  }
});
