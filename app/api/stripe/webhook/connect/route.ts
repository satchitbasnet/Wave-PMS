import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import {
  StripeConfigError,
  requireConnectWebhookSecret,
} from "@/lib/stripe/config";

/**
 * POST /api/stripe/webhook/connect
 *
 * Thin-event webhook for V2 Connect account requirement / capability changes.
 *
 * Dashboard setup:
 * 1. Developers → Webhooks → + Add destination
 * 2. Events from: Connected accounts
 * 3. Payload style: Thin
 * 4. Events: v2.core.account[requirements].updated,
 *    v2.core.account[configuration.merchant].capability_status_updated,
 *    v2.core.account[configuration.customer].capability_status_updated
 *
 * Local testing:
 * stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to http://localhost:3000/api/stripe/webhook/connect
 *
 * @see https://docs.stripe.com/webhooks?snapshot-or-thin=thin
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  try {
    const stripeClient = getStripeClient();
    const webhookSecret = requireConnectWebhookSecret();

    // Step 1: Parse the thin event notification (SDK v22+ uses parseEventNotification)
    const notification = stripeClient.parseEventNotification(
      body,
      signature,
      webhookSecret
    );

    // Step 2: Fetch full event payload to understand what changed
    const event = await stripeClient.v2.core.events.retrieve(notification.id);

    // Step 3: Handle by event type — collect any updated requirements
    switch (event.type) {
      case "v2.core.account[requirements].updated": {
        // Requirements changed (regulatory / network updates). Re-fetch account
        // status in your UI or notify the connected account owner.
        console.log(
          "[Connect thin] requirements updated for account-related object:",
          event.related_object?.id
        );
        // TODO: Optionally email the account owner or flag org in DB for review
        break;
      }

      case "v2.core.account[configuration.merchant].capability_status_updated": {
        console.log(
          "[Connect thin] merchant capability status updated:",
          event.type
        );
        // TODO: When card_payments becomes active, enable storefront in your app
        break;
      }

      case "v2.core.account[configuration.customer].capability_status_updated": {
        console.log(
          "[Connect thin] customer capability status updated:",
          event.type
        );
        break;
      }

      default:
        console.log("[Connect thin] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      console.error(error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Connect thin webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
