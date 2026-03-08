import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "signup_completed"
  | "vote_cast"
  | "submission_created"
  | "plan_upgrade_clicked"
  | "page_view";

// Deduplication guard for page_view
let lastPageViewPath: string | null = null;
let lastPageViewTs = 0;
const DEDUP_INTERVAL_MS = 3000;

const CONSENT_KEY = "wma-cookie-consent";

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const prefs = JSON.parse(raw);
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

export async function trackEvent(
  eventName: EventName,
  properties?: Record<string, unknown>
) {
  try {
    // Only track if user consented to analytics cookies
    if (!hasAnalyticsConsent()) return;

    // Deduplicate page_view: ignore if same path within 3s
    if (eventName === "page_view") {
      const path = (properties?.path as string) ?? "";
      const now = Date.now();
      if (path === lastPageViewPath && now - lastPageViewTs < DEDUP_INTERVAL_MS) {
        return;
      }
      lastPageViewPath = path;
      lastPageViewTs = now;

      // Enrich page_view with referrer
      properties = {
        ...properties,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    await supabase.from("analytics_events").insert({
      user_id: userId,
      event_name: eventName,
      properties: properties ?? {},
    });
  } catch {
    // Fire-and-forget — never block UI
  }
}
