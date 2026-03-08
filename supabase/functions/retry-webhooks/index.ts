import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[RETRY-WEBHOOKS] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY" });
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  try {
    // Fetch failed events eligible for retry
    const { data: events, error: fetchError } = await supabase
      .from("webhook_events")
      .select("*")
      .eq("status", "failed")
      .lt("retry_count", 5)
      .lte("next_retry_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      logStep("No events to retry");
      return new Response(JSON.stringify({ retried: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    logStep("Events to retry", { count: events.length });

    let successCount = 0;
    let failCount = 0;

    for (const evt of events) {
      const newRetryCount = (evt.retry_count || 0) + 1;
      try {
        // Re-fetch the event from Stripe to get fresh data
        const stripeEvent = await stripe.events.retrieve(evt.stripe_event_id);
        logStep("Re-processing event", {
          id: stripeEvent.id,
          type: stripeEvent.type,
          attempt: newRetryCount,
        });

        // Process based on event type
        await processStripeEvent(stripeEvent, supabase);

        // Mark as processed
        await supabase
          .from("webhook_events")
          .update({
            status: "processed",
            retry_count: newRetryCount,
            processed_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", evt.id);

        successCount++;
        logStep("Retry succeeded", { eventId: evt.stripe_event_id, attempt: newRetryCount });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        // Exponential backoff: 2^retry * 60 seconds (1min, 2min, 4min, 8min, 16min)
        const backoffSeconds = Math.pow(2, newRetryCount) * 60;
        const nextRetry = new Date(Date.now() + backoffSeconds * 1000).toISOString();

        const updateData: Record<string, unknown> = {
          retry_count: newRetryCount,
          error_message: msg,
        };

        if (newRetryCount >= 5) {
          updateData.status = "dead_letter";
          logStep("Max retries reached — dead letter", { eventId: evt.stripe_event_id });
        } else {
          updateData.next_retry_at = nextRetry;
          logStep("Retry failed, scheduling next", {
            eventId: evt.stripe_event_id,
            attempt: newRetryCount,
            nextRetry,
          });
        }

        await supabase
          .from("webhook_events")
          .update(updateData)
          .eq("id", evt.id);

        failCount++;
      }
    }

    logStep("Retry batch complete", { successCount, failCount });

    return new Response(
      JSON.stringify({ retried: events.length, successCount, failCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// deno-lint-ignore no-explicit-any
async function processStripeEvent(event: Stripe.Event, supabase: any) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Re-processing checkout", { customer: session.customer });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      logStep("Re-processing invoice paid", { customer: invoice.customer });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      logStep("Re-processing payment failed", { customer: invoice.customer });
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      logStep("Re-processing subscription updated", { id: sub.id, status: sub.status });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      logStep("Re-processing subscription deleted", { id: sub.id });
      break;
    }
    default:
      logStep("Unhandled event type on retry", { type: event.type });
  }
}
