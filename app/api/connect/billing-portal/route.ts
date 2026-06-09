import { NextResponse } from "next/server";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { getOrgConnectAccountId } from "@/lib/stripe/connect-db";

/**
 * POST /api/connect/billing-portal
 *
 * Opens the Stripe Customer Portal for the connected account's platform subscription.
 * Uses customer_account (V2) — not customer.
 */
export async function POST() {
  try {
    const stripeClient = getStripeClient();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mapping = await getOrgConnectAccountId(user.id);
    if (!mapping?.connectAccountId) {
      return NextResponse.json(
        { error: "No connected account" },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();

    const session = await stripeClient.billingPortal.sessions.create({
      customer_account: mapping.connectAccountId,
      return_url: `${appUrl}/dashboard/connect/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
