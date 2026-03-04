import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/cast-vote`;

// Helper to safely parse JSON response
async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Test: Rejects unauthenticated requests ───
Deno.test("cast-vote: rejects request without auth header", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ submission_id: "00000000-0000-0000-0000-000000000000" }),
  });

  await safeJson(res);
  assertEquals(res.status >= 400, true, `Expected 4xx/5xx, got ${res.status}`);
});

// ─── Test: Rejects invalid auth token ───
Deno.test("cast-vote: rejects invalid auth token", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer invalid-token-12345",
    },
    body: JSON.stringify({ submission_id: "00000000-0000-0000-0000-000000000000" }),
  });

  await safeJson(res);
  assertEquals(res.status >= 400, true, `Expected 4xx/5xx, got ${res.status}`);
});

// ─── Test: Function is reachable and returns structured error ───
Deno.test("cast-vote: rejects fake JWT with error status", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjB9.fake",
    },
    body: JSON.stringify({}),
  });

  await res.text(); // consume body
  assertEquals(res.status >= 400, true, `Expected error status, got ${res.status}`);
});

// ─── Test: CORS preflight ───
Deno.test("cast-vote: handles OPTIONS preflight correctly", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      Origin: "https://weeklymusicawards.com",
      apikey: SUPABASE_ANON_KEY,
    },
  });

  await res.text();
  assertEquals(res.status, 200);
  const allowHeaders = res.headers.get("Access-Control-Allow-Headers");
  assertEquals(allowHeaders?.includes("authorization"), true);
  assertEquals(allowHeaders?.includes("content-type"), true);
});

// ─── Test: Security headers present ───
Deno.test("cast-vote: includes security headers in CORS response", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      Origin: "https://weeklymusicawards.com",
      apikey: SUPABASE_ANON_KEY,
    },
  });

  await res.text();
  assertEquals(res.headers.get("X-Content-Type-Options"), "nosniff");
  assertEquals(res.headers.get("X-Frame-Options"), "DENY");
});
