import { NextResponse } from "next/server";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";

/**
 * POST /api/connect/checkout
 *
 * Direct Charge: hosted Checkout on the connected account.
 * Body: { accountId, priceId, quantity? }
 *
 * @see https://docs.stripe.com/connect/direct-charges
 */
export async function POST(request: Request) {
  try {
    const stripeClient = getStripeClient();
    const { accountId, priceId, quantity = 1 } = await request.json();

    if (!accountId || !priceId) {
      return NextResponse.json(
        { error: "accountId and priceId are required" },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();

    const session = await stripeClient.checkout.sessions.create(
      {
        line_items: [{ price: priceId, quantity: Number(quantity) }],
        mode: "payment",
        success_url: `${appUrl}/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/store/${accountId}`,
      },
      { stripeAccount: accountId }
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Connect checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
