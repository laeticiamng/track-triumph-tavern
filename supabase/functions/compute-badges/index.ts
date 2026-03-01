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

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
      
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some(r => r.role === "admin");
      if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: cors });
    }

    const { week_id } = await req.json();
    if (!week_id) return new Response(JSON.stringify({ error: "week_id required" }), { status: 400, headers: cors });

    // Get all votes for this week
    const { data: votes } = await supabase
      .from("votes")
      .select("id, user_id, category_id, comment, submission_id, created_at")
      .eq("week_id", week_id)
      .eq("is_valid", true);

    if (!votes || votes.length === 0) {
      return new Response(JSON.stringify({ badges: [], message: "No votes this week" }), { headers: cors });
    }

    const badges: Array<{ user_id: string; badge_type: string; metadata: Record<string, unknown> }> = [];

    // 🏆 TOP VOTER: user with most votes
    const votesByUser = new Map<string, number>();
    for (const v of votes) {
      votesByUser.set(v.user_id, (votesByUser.get(v.user_id) || 0) + 1);
    }
    const maxVotes = Math.max(...votesByUser.values());
    for (const [uid, count] of votesByUser) {
      if (count === maxVotes) {
        badges.push({ user_id: uid, badge_type: "top_voter", metadata: { vote_count: count } });
      }
    }

    // 📝 CRITIQUE ÉTOILÉ: user with most comments
    const commentsByUser = new Map<string, number>();
    for (const v of votes) {
      if (v.comment && v.comment.trim().length > 0) {
        commentsByUser.set(v.user_id, (commentsByUser.get(v.user_id) || 0) + 1);
      }
    }
    if (commentsByUser.size > 0) {
      const maxComments = Math.max(...commentsByUser.values());
      for (const [uid, count] of commentsByUser) {
        if (count === maxComments) {
          badges.push({ user_id: uid, badge_type: "critic", metadata: { comment_count: count } });
        }
      }
    }

    // 🌈 ÉCLECTIQUE: user who voted in most distinct categories
    const categoriesByUser = new Map<string, Set<string>>();
    for (const v of votes) {
      if (!categoriesByUser.has(v.user_id)) categoriesByUser.set(v.user_id, new Set());
      categoriesByUser.get(v.user_id)!.add(v.category_id);
    }
    const maxCats = Math.max(...[...categoriesByUser.values()].map(s => s.size));
    if (maxCats >= 3) {
      for (const [uid, cats] of categoriesByUser) {
        if (cats.size === maxCats) {
          badges.push({ user_id: uid, badge_type: "eclectic", metadata: { category_count: cats.size } });
        }
      }
    }

    // 🔍 DÉCOUVREUR: first voter on a submission that ended in Top 3
    const { data: winners } = await supabase
      .from("winners")
      .select("submission_id")
      .eq("week_id", week_id)
      .lte("rank", 3);

    if (winners && winners.length > 0) {
      const winnerSubIds = new Set(winners.map(w => w.submission_id));
      // Find first voter for each winning submission
      const discoverers = new Map<string, string>(); // submission_id -> user_id
      const winningVotes = votes
        .filter(v => winnerSubIds.has(v.submission_id))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const v of winningVotes) {
        if (!discoverers.has(v.submission_id)) {
          discoverers.set(v.submission_id, v.user_id);
        }
      }

      const discovererUsers = new Set(discoverers.values());
      for (const uid of discovererUsers) {
        const discovered = [...discoverers.entries()].filter(([, u]) => u === uid).map(([s]) => s);
        badges.push({ user_id: uid, badge_type: "discoverer", metadata: { discovered_submissions: discovered } });
      }
    }

    // Upsert badges
    if (badges.length > 0) {
      const rows = badges.map(b => ({ ...b, week_id }));
      const { error } = await supabase.from("weekly_badges").upsert(rows, { onConflict: "user_id,week_id,badge_type" });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ badges: badges.length, details: badges }), { headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
