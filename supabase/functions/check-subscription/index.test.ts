import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/check-subscription`;

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Test: Rejects unauthenticated requests ───
Deno.test("check-subscription: rejects request without auth header", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  await safeJson(res);
  assertEquals(res.status >= 400, true, `Expected 4xx/5xx, got ${res.status}`);
});

// ─── Test: Rejects invalid auth token ───
Deno.test("check-subscription: rejects fake JWT", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjB9.fake",
    },
    body: JSON.stringify({}),
  });

  await safeJson(res);
  assertEquals(res.status >= 400, true, `Expected error status, got ${res.status}`);
});

// ─── Test: CORS preflight ───
Deno.test("check-subscription: handles OPTIONS preflight correctly", async () => {
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

// ─── Test: Error response is not 200 ───
Deno.test("check-subscription: does not return 200 without auth", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  await res.text();
  assertEquals(res.status !== 200, true, "Should not return 200 without auth");
});
