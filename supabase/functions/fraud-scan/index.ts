import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

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
    // ── Auth + Admin check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Non authentifié" }, 401);

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
    if (authError || !user) return jsonResponse({ error: "Non authentifié" }, 401);

    // Check admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return jsonResponse({ error: "Accès réservé aux administrateurs" }, 403);
    }

    // ── Parse input ──
    const body = await req.json();
    const { week_id, invalidate = false, dry_run = true } = body;

    if (!week_id) return jsonResponse({ error: "week_id requis" }, 400);

    console.log(`fraud-scan: week=${week_id}, invalidate=${invalidate}, dry_run=${dry_run}`);

    // ── Load vote events for the week (join votes) ──
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("vote_events")
      .select("id, vote_id, user_id, ip_address, user_agent, created_at, event_type, metadata")
      .eq("event_type", "cast")
      .order("created_at", { ascending: true });

    if (eventsError) {
      console.error("Error loading vote_events:", eventsError);
      return jsonResponse({ error: "Erreur lors du chargement des événements" }, 500);
    }

    // Load votes for the specific week
    const { data: weekVotes, error: votesError } = await supabaseAdmin
      .from("votes")
      .select("id, user_id, submission_id, category_id, week_id, is_valid, created_at")
      .eq("week_id", week_id);

    if (votesError) {
      console.error("Error loading votes:", votesError);
      return jsonResponse({ error: "Erreur lors du chargement des votes" }, 500);
    }

    const weekVoteIds = new Set((weekVotes || []).map((v: { id: string }) => v.id));
    const weekEvents = (events || []).filter((e: { vote_id: string }) => weekVoteIds.has(e.vote_id));

    // Load submissions for context
    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select("id, title, artist_name")
      .eq("week_id", week_id);

    const submissionMap = new Map((submissions || []).map((s: { id: string; title: string; artist_name: string }) => [s.id, s]));

    // Load profiles for account age check
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, created_at");

    const profileMap = new Map((profiles || []).map((p: { id: string; display_name: string; created_at: string }) => [p.id, p]));

    // ── Analysis 1: Burst detection (3+ votes in 2 minutes per user) ──
    const userEvents = new Map<string, Array<{ user_id: string; created_at: string; vote_id: string; ip_address: string }>>();
    for (const evt of weekEvents) {
      const list = userEvents.get(evt.user_id) || [];
      list.push(evt);
      userEvents.set(evt.user_id, list);
    }

    const burstUsers = new Set<string>();
    for (const [userId, evts] of userEvents) {
      const sorted = evts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      for (let i = 0; i <= sorted.length - 3; i++) {
        const t0 = new Date(sorted[i].created_at).getTime();
        const t2 = new Date(sorted[i + 2].created_at).getTime();
        if (t2 - t0 <= 120_000) {
          burstUsers.add(userId);
          break;
        }
      }
    }

    // ── Analysis 2: IP clusters (3+ distinct users from same IP) ──
    const ipUsers = new Map<string, Set<string>>();
    const ipVoteCounts = new Map<string, number>();
    for (const evt of weekEvents) {
      const ip = String(evt.ip_address || "unknown");
      if (ip === "unknown" || ip === "null") continue;
      const users = ipUsers.get(ip) || new Set();
      users.add(evt.user_id);
      ipUsers.set(ip, users);
      ipVoteCounts.set(ip, (ipVoteCounts.get(ip) || 0) + 1);
    }

    const suspiciousIps: Array<{ ip: string; distinct_users: number; vote_count: number }> = [];
    for (const [ip, users] of ipUsers) {
      if (users.size >= 3) {
        suspiciousIps.push({
          ip,
          distinct_users: users.size,
          vote_count: ipVoteCounts.get(ip) || 0,
        });
      }
    }

    // ── Analysis 3: New accounts (created < 24h before voting) ──
    const newAccountUsers = new Set<string>();
    for (const [userId] of userEvents) {
      const profile = profileMap.get(userId);
      if (profile) {
        const createdAt = new Date(profile.created_at).getTime();
        const firstVote = userEvents.get(userId)?.[0];
        if (firstVote) {
          const voteTime = new Date(firstVote.created_at).getTime();
          if (voteTime - createdAt < 86_400_000) {
            newAccountUsers.add(userId);
          }
        }
      }
    }

    // ── Analysis 4: IP concentration per submission (>50% from same IP) ──
    const votesBySubmission = new Map<string, Array<{ id: string; submission_id: string }>>();
    for (const v of (weekVotes || [])) {
      const list = votesBySubmission.get(v.submission_id) || [];
      list.push(v);
      votesBySubmission.set(v.submission_id, list);
    }

    // Map vote_id -> ip
    const voteIpMap = new Map<string, string>();
    for (const evt of weekEvents) {
      const ip = String(evt.ip_address || "unknown");
      if (ip !== "unknown" && ip !== "null") {
        voteIpMap.set(evt.vote_id, ip);
      }
    }

    const suspiciousSubmissions: Array<{ submission_id: string; title: string; artist_name: string; dominant_ip: string; ip_vote_ratio: number; flags: string[] }> = [];
    for (const [subId, votes] of votesBySubmission) {
      if (votes.length < 3) continue;
      const ipCounts = new Map<string, number>();
      for (const v of votes) {
        const ip = voteIpMap.get(v.id);
        if (ip) ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
      }
      for (const [ip, count] of ipCounts) {
        if (count / votes.length > 0.5) {
          const sub = submissionMap.get(subId);
          suspiciousSubmissions.push({
            submission_id: subId,
            title: sub?.title || "Inconnu",
            artist_name: sub?.artist_name || "Inconnu",
            dominant_ip: ip,
            ip_vote_ratio: Math.round((count / votes.length) * 100),
            flags: ["ip_concentration"],
          });
          break;
        }
      }
    }

    // ── Build suspicious users list ──
    const allSuspectUserIds = new Set([...burstUsers, ...newAccountUsers]);
    // Also add users from suspicious IPs
    for (const ipInfo of suspiciousIps) {
      const users = ipUsers.get(ipInfo.ip);
      if (users) for (const uid of users) allSuspectUserIds.add(uid);
    }

    const suspiciousUsers: Array<{ user_id: string; display_name: string; vote_count: number; flags: string[] }> = [];
    for (const userId of allSuspectUserIds) {
      const flags: string[] = [];
      if (burstUsers.has(userId)) flags.push("burst");
      if (newAccountUsers.has(userId)) flags.push("new_account");
      // Check if in IP cluster
      for (const ipInfo of suspiciousIps) {
        if (ipUsers.get(ipInfo.ip)?.has(userId)) {
          flags.push("ip_cluster");
          break;
        }
      }
      const profile = profileMap.get(userId);
      suspiciousUsers.push({
        user_id: userId,
        display_name: profile?.display_name || "Inconnu",
        vote_count: userEvents.get(userId)?.length || 0,
        flags,
      });
    }

    // ── Collect all flagged vote IDs ──
    const flaggedVoteIds = new Set<string>();
    for (const userId of allSuspectUserIds) {
      const evts = userEvents.get(userId);
      if (evts) for (const e of evts) flaggedVoteIds.add(e.vote_id);
    }
    for (const sub of suspiciousSubmissions) {
      const votes = votesBySubmission.get(sub.submission_id) || [];
      for (const v of votes) {
        const ip = voteIpMap.get(v.id);
        if (ip === sub.dominant_ip) flaggedVoteIds.add(v.id);
      }
    }

    // ── Invalidation (if requested) ──
    let invalidatedCount = 0;
    if (invalidate && !dry_run && flaggedVoteIds.size > 0) {
      const ids = Array.from(flaggedVoteIds);

      // Batch update votes
      const { error: updateError } = await supabaseAdmin
        .from("votes")
        .update({ is_valid: false })
        .in("id", ids);

      if (updateError) {
        console.error("Error invalidating votes:", updateError);
      } else {
        invalidatedCount = ids.length;

        // Insert invalidation events
        const invalidationEvents = ids.map((voteId) => ({
          vote_id: voteId,
          user_id: user.id,
          event_type: "invalidated",
          metadata: { invalidated_by: user.id, reason: "fraud_scan" },
        }));

        await supabaseAdmin.from("vote_events").insert(invalidationEvents);
        console.log(`Invalidated ${invalidatedCount} votes`);
      }
    }

    // ── Build summary ──
    const summary = {
      total_votes: weekVotes?.length || 0,
      flagged_votes: flaggedVoteIds.size,
      flagged_users: allSuspectUserIds.size,
      flagged_ips: suspiciousIps.length,
      invalidated: invalidatedCount,
      mode: dry_run ? "dry_run" : "live",
    };

    console.log("fraud-scan summary:", JSON.stringify(summary));

    return jsonResponse({
      suspicious_users: suspiciousUsers,
      suspicious_ips: suspiciousIps,
      suspicious_submissions: suspiciousSubmissions,
      summary,
    });
  } catch (err) {
    console.error("fraud-scan error:", err);
    return jsonResponse({ error: "Erreur interne" }, 500);
  }
});
