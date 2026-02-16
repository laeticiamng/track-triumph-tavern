const ALLOWED_ORIGINS = [
  "https://weeklymusicawards.com",
  "https://www.weeklymusicawards.com",
];

// In development, also allow localhost
if (Deno.env.get("ENVIRONMENT") !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:8080");
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Vary": "Origin",
  };
}
