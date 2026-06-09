import { NextResponse } from "next/server";
import {
  StripeConfigError,
  getAppUrl,
  requirePlatformSubscriptionPriceId,
} from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { getOrgConnectAccountId } from "@/lib/stripe/connect-db";

/**
 * POST /api/connect/platform-checkout
 *
 * Platform subscription billed TO the connected account using customer_account.
 * With V2 accounts, the same acct_ ID is used for customer_account.
 *
 * Do NOT use .customer for V2 — use customer_account.
 */
export async function POST() {
  try {
    const stripeClient = getStripeClient();
    const priceId = requirePlatformSubscriptionPriceId();

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
        { error: "Create and onboard a connected account first." },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const accountId = mapping.connectAccountId;

    const session = await stripeClient.checkout.sessions.create({
      // PLACEHOLDER: acct_... from your connected account — same ID as customer_account
      customer_account: accountId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/connect/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/connect/subscription?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Platform checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout" },
      { status: 500 }
    );
  }
}
