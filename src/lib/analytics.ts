import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "signup_completed"
  | "vote_cast"
  | "submission_created"
  | "plan_upgrade_clicked"
  | "page_view";

export async function trackEvent(
  eventName: EventName,
  properties?: Record<string, unknown>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    await supabase.from("analytics_events" as any).insert({
      user_id: userId,
      event_name: eventName,
      properties: properties ?? {},
    });
  } catch {
    // Fire-and-forget — never block UI
  }
}
