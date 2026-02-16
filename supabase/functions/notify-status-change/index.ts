import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
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

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
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

    // Get artist's email
    const { data: artistUser } = await supabaseAdmin.auth.admin.getUserById(
      submission.user_id
    );

    if (!artistUser?.user?.email) {
      return jsonResponse({ error: "Email artiste introuvable" }, 404);
    }

    const email = artistUser.user.email;
    const safeArtistName = escapeHtml(submission.artist_name);
    const safeTrackTitle = escapeHtml(submission.title);
    const safeReason = reason ? escapeHtml(reason) : "";

    // Build email content based on status
    let subject: string;
    let htmlBody: string;

    switch (new_status) {
      case "approved":
        subject = `Votre morceau "${submission.title}" est approuve !`;
        htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Felicitations ${safeArtistName} !</h2>
            <p>Votre soumission <strong>&laquo;${safeTrackTitle}&raquo;</strong> a ete approuvee par notre equipe de moderation.</p>
            <p>Votre morceau est maintenant visible par la communaute et peut recevoir des votes.</p>
            <a href="https://weeklymusicawards.com/explore"
               style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
              Voir le concours
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              Bonne chance pour cette semaine !<br>
              L'equipe Weekly Music Awards
            </p>
          </div>`;
        break;

      case "rejected":
        subject = `Mise a jour sur "${submission.title}"`;
        htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bonjour ${safeArtistName},</h2>
            <p>Apres examen par notre equipe, votre soumission <strong>&laquo;${safeTrackTitle}&raquo;</strong> n'a pas pu etre approuvee cette fois-ci.</p>
            ${safeReason ? `<p><strong>Motif :</strong> ${safeReason}</p>` : ""}
            <p>Vous pouvez soumettre un nouveau morceau la semaine prochaine. N'hesitez pas a consulter nos regles de soumission.</p>
            <a href="https://weeklymusicawards.com/contest-rules"
               style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
              Regles du concours
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              A bientot,<br>
              L'equipe Weekly Music Awards
            </p>
          </div>`;
        break;

      default:
        subject = `Votre soumission "${submission.title}" est en attente de moderation`;
        htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bonjour ${safeArtistName},</h2>
            <p>Votre soumission <strong>&laquo;${safeTrackTitle}&raquo;</strong> est en cours de moderation. Nous vous tiendrons informe de la suite.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              L'equipe Weekly Music Awards
            </p>
          </div>`;
        break;
    }

    // TODO: integrate a transactional email service (Resend, SendGrid, etc.)
    console.log(`[NOTIFY] ${new_status} — user: ${submission.user_id}, track: ${submission.title}`);

    // Store notification record for the user (can be displayed in-app)
    await supabaseAdmin.from("vote_events").insert({
      vote_id: null,
      user_id: submission.user_id,
      event_type: `submission_${new_status}`,
      metadata: {
        submission_id,
        track_title: submission.title,
        artist_name: submission.artist_name,
        reason: reason || null,
        notified_email: email,
        subject,
      },
    });

    return jsonResponse({
      success: true,
      notified: submission.user_id,
      status: new_status,
      subject,
    });
  } catch (err) {
    console.error("notify-status-change error:", err);
    return jsonResponse({ error: "Erreur interne" }, 500);
  }
});
