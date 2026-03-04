import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push requires manual crypto for VAPID + payload encryption.
// We use Web Crypto APIs (available in Deno/Edge) to implement RFC 8291 + RFC 8292.

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const publicKeyBytes = base64UrlDecode(publicKeyB64);
  const privateKeyBytes = base64UrlDecode(privateKeyB64);

  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    []
  );

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: arrayBufferToBase64Url(publicKeyBytes.slice(1, 33)),
      y: arrayBufferToBase64Url(publicKeyBytes.slice(33, 65)),
      d: arrayBufferToBase64Url(privateKeyBytes),
      ext: true,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );

  return { publicKey, privateKey, publicKeyBytes };
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(
  privateKey: CryptoKey,
  aud: string,
  sub: string,
  exp: number
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud, exp, sub };

  const encodedHeader = arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const encodedPayload = arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    data
  );

  // Convert DER signature to raw r|s format
  const rawSig = derToRaw(new Uint8Array(signature));
  const encodedSignature = arrayBufferToBase64Url(rawSig);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // Check if it's actually DER format
  if (der[0] !== 0x30) return der;
  
  const raw = new Uint8Array(64);
  let offset = 2;
  
  // r value
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen === 33 ? offset + 1 : offset;
  raw.set(der.slice(rStart, rStart + 32), 0);
  offset += rLen;
  
  // s value  
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen === 33 ? offset + 1 : offset;
  raw.set(der.slice(sStart, sStart + 32), 32);
  
  return raw;
}

async function encryptPayload(
  payload: string,
  subscriptionKeys: { p256dh: string; auth: string }
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const clientPublicKey = base64UrlDecode(subscriptionKeys.p256dh);
  const clientAuth = base64UrlDecode(subscriptionKeys.auth);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF-based key derivation (RFC 8291)
  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prk = await hkdfExtract(clientAuth, sharedSecret);

  const keyInfo = createInfo("aesgcm", clientPublicKey, localPublicKeyRaw);
  const nonceInfo = createInfo("nonce", clientPublicKey, localPublicKeyRaw);

  const ikm = await hkdfExpand(prk, authInfo, 32);
  const prkFinal = await hkdfExtract(salt, ikm);
  const contentKey = await hkdfExpand(prkFinal, keyInfo, 16);
  const nonce = await hkdfExpand(prkFinal, nonceInfo, 12);

  // Encrypt
  const paddedPayload = new Uint8Array(2 + new TextEncoder().encode(payload).length);
  paddedPayload.set([0, 0], 0);
  paddedPayload.set(new TextEncoder().encode(payload), 2);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    contentKey,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      paddedPayload
    )
  );

  return { ciphertext: encrypted, salt, localPublicKey: localPublicKeyRaw };
}

function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  const label = new TextEncoder().encode(`Content-Encoding: ${type}\0P-256\0`);
  const info = new Uint8Array(label.length + 4 + clientPublicKey.length + serverPublicKey.length);
  let offset = 0;
  info.set(label, offset);
  offset += label.length;
  info[offset++] = 0;
  info[offset++] = clientPublicKey.length;
  info.set(clientPublicKey, offset);
  offset += clientPublicKey.length;
  info[offset++] = 0;
  info[offset++] = serverPublicKey.length;
  info.set(serverPublicKey, offset);
  return info;
}

async function hkdfExtract(
  salt: Uint8Array,
  ikm: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const input = new Uint8Array(info.length + 1);
  input.set(info, 0);
  input[info.length] = 1;
  const output = new Uint8Array(await crypto.subtle.sign("HMAC", key, input));
  return output.slice(0, length);
}

// URL mapping for push notification routes
const ROUTE_MAP: Record<string, string> = {
  vote_received: "/submissions/",
  results_published: "/results",
  new_week: "/vote",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:contact@weeklymusicawards.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { notification_id, user_id, title, body, type, metadata } = await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all push subscriptions for this user
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, reason: "no_subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vapidKeys = await importVapidKeys(vapidPublicKey, vapidPrivateKey);

    // Build push payload
    const routeBase = ROUTE_MAP[type] || "/";
    const url = type === "vote_received" && metadata?.submission_id
      ? `${routeBase}${metadata.submission_id}`
      : routeBase;

    const pushPayload = JSON.stringify({
      title,
      body: body || "",
      url,
      tag: `wma-${type || "notification"}`,
    });

    let sent = 0;
    const staleEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const endpoint = sub.endpoint;
        const keys = sub.keys as { p256dh: string; auth: string };

        // Create VAPID JWT
        const aud = new URL(endpoint).origin;
        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12 hours
        const jwt = await createJWT(vapidKeys.privateKey, aud, vapidSubject, exp);

        // Encrypt payload
        const { ciphertext, salt, localPublicKey } = await encryptPayload(pushPayload, keys);

        // Send push
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aesgcm",
            "Content-Length": ciphertext.length.toString(),
            Authorization: `vapid t=${jwt}, k=${arrayBufferToBase64Url(vapidKeys.publicKeyBytes)}`,
            "Crypto-Key": `dh=${arrayBufferToBase64Url(localPublicKey)}`,
            Encryption: `salt=${arrayBufferToBase64Url(salt)}`,
            TTL: "86400",
            Urgency: "normal",
          },
          body: ciphertext,
        });

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 404 || response.status === 410) {
          // Subscription expired/invalid
          staleEndpoints.push(endpoint);
        }
      } catch (err) {
        console.error("Push send error:", err);
      }
    }

    // Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length, cleaned: staleEndpoints.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
