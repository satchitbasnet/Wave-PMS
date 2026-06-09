import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";

/**
 * GET /api/store/[accountId]/products
 *
 * Public storefront: list products for a connected account.
 *
 * NOTE: accountId is in the URL for this demo. In production, use a friendly
 * slug or your own identifier instead of exposing acct_... in URLs.
 */
export async function GET(
  _request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const stripeClient = getStripeClient();
    const accountId = params.accountId;

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid connected account ID" },
        { status: 400 }
      );
    }

    const products = await stripeClient.products.list(
      {
        limit: 20,
        active: true,
        expand: ["data.default_price"],
      },
      { stripeAccount: accountId }
    );

    return NextResponse.json({ products: products.data });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to load storefront products" },
      { status: 500 }
    );
  }
}
