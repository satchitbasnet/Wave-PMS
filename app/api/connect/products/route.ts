import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { getOrgConnectAccountId } from "@/lib/stripe/connect-db";

/**
 * GET /api/connect/products — list products on the connected account.
 * POST /api/connect/products — create a product on the connected account.
 *
 * Uses the Stripe-Account header via { stripeAccount: accountId }.
 * @see https://docs.stripe.com/connect/authentication
 */
export async function GET() {
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

    const products = await stripeClient.products.list(
      {
        limit: 20,
        active: true,
        expand: ["data.default_price"],
      },
      { stripeAccount: mapping.connectAccountId }
    );

    return NextResponse.json({ products: products.data });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to list products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, description, priceInCents, currency = "usd" } = body;

    if (!name || !priceInCents) {
      return NextResponse.json(
        { error: "name and priceInCents are required" },
        { status: 400 }
      );
    }

    const product = await stripeClient.products.create(
      {
        name,
        description: description ?? undefined,
        default_price_data: {
          unit_amount: Number(priceInCents),
          currency,
        },
      },
      { stripeAccount: mapping.connectAccountId }
    );

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Create connect product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
