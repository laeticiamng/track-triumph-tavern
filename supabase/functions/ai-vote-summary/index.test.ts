import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-vote-summary`;

async function safeConsume(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return null; }
}

Deno.test("ai-vote-summary: rejects request without auth header", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({}),
  });
  await res.text();
  assertEquals(res.status >= 400, true, `Expected 4xx/5xx, got ${res.status}`);
});

Deno.test("ai-vote-summary: rejects fake JWT", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjB9.fake",
    },
    body: JSON.stringify({}),
  });
  await safeConsume(res);
  assertEquals(res.status >= 400, true, `Expected error status, got ${res.status}`);
});

Deno.test("ai-vote-summary: handles OPTIONS preflight correctly", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: { Origin: "https://track-triumph-tavern.lovable.app", apikey: SUPABASE_ANON_KEY },
  });
  await res.text();
  assertEquals(res.status, 200);
  const allowHeaders = res.headers.get("Access-Control-Allow-Headers");
  assertEquals(allowHeaders?.includes("authorization"), true);
});

Deno.test("ai-vote-summary: does not return 200 without auth", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({}),
  });
  await safeConsume(res);
  assertEquals(res.status !== 200, true, "Should not return 200 without auth");
});
