import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fraud-scan`;

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Test: Rejects unauthenticated requests ───
Deno.test("fraud-scan: rejects request without auth header", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ week_id: "00000000-0000-0000-0000-000000000000" }),
  });

  await res.text();
  assertEquals(res.status >= 400, true, `Expected 4xx/5xx, got ${res.status}`);
});

// ─── Test: Rejects fake JWT ───
Deno.test("fraud-scan: rejects fake JWT", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjB9.fake",
    },
    body: JSON.stringify({ week_id: "00000000-0000-0000-0000-000000000000" }),
  });

  await safeJson(res);
  assertEquals(res.status >= 400, true, `Expected error status, got ${res.status}`);
});

// ─── Test: CORS preflight ───
Deno.test("fraud-scan: handles OPTIONS preflight correctly", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      Origin: "https://track-triumph-tavern.lovable.app",
      apikey: SUPABASE_ANON_KEY,
    },
  });

  await res.text();
  assertEquals(res.status, 200);
  const allowHeaders = res.headers.get("Access-Control-Allow-Headers");
  assertEquals(allowHeaders?.includes("authorization"), true);
});

// ─── Test: Requires week_id parameter ───
Deno.test("fraud-scan: returns 401 without auth even with valid body", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ week_id: "00000000-0000-0000-0000-000000000000", dry_run: true }),
  });

  await safeJson(res);
  assertEquals(res.status, 401);
});

// ─── Test: Admin-only access ───
Deno.test("fraud-scan: does not return 200 without authentication", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ week_id: "test", invalidate: false, dry_run: true }),
  });

  await safeJson(res);
  assertEquals(res.status !== 200, true, "Should not return 200 without admin auth");
});
