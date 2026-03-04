import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function arrayBufferToBase64Url(buffer: Uint8Array): string {
  let binary = "";
  for (const b of buffer) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate VAPID key pair using Web Crypto
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Export public key as raw (65 bytes uncompressed)
    const publicKeyRaw = new Uint8Array(
      await crypto.subtle.exportKey("raw", keyPair.publicKey)
    );

    // Export private key as JWK to get the 'd' parameter
    const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const privateKeyB64 = privateJwk.d!;

    const publicKeyB64 = arrayBufferToBase64Url(publicKeyRaw);

    return new Response(
      JSON.stringify({
        publicKey: publicKeyB64,
        privateKey: privateKeyB64,
        instructions: [
          "1. Save publicKey as VAPID_PUBLIC_KEY secret",
          "2. Save privateKey as VAPID_PRIVATE_KEY secret",
          "3. Update VAPID_PUBLIC_KEY in src/hooks/use-push-notifications.ts",
          "4. Optionally set VAPID_SUBJECT secret (e.g. mailto:contact@yourdomain.com)",
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
