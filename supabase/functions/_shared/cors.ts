const ALLOWED_ORIGINS = [
  "https://weeklymusicawards.com",
  "https://www.weeklymusicawards.com",
  "https://track-triumph-tavern.lovable.app",
];

// In development / preview, also allow Lovable preview domains and localhost
if (Deno.env.get("ENVIRONMENT") !== "production") {
  ALLOWED_ORIGINS.push(
    "http://localhost:5173",
    "http://localhost:8080",
  );
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";

  // Allow any *.lovableproject.com or *.lovable.app preview origin
  const isLovablePreview =
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.app");

  const allowed = ALLOWED_ORIGINS.includes(origin) || isLovablePreview
    ? origin
    : ALLOWED_ORIGINS[0];

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
