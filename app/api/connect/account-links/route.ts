import { NextResponse } from "next/server";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { createConnectAccountLink } from "@/lib/stripe/connect";
import { getOrgConnectAccountId } from "@/lib/stripe/connect-db";

/**
 * POST /api/connect/account-links
 *
 * Creates a Stripe-hosted onboarding link for the user's connected account.
 */
export async function POST() {
  try {
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
        { error: "Create a connected account first." },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const accountId = mapping.connectAccountId;

    const accountLink = await createConnectAccountLink(
      accountId,
      `${appUrl}/dashboard/connect?refresh=1`,
      `${appUrl}/connect/return?accountId=${accountId}`
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Account link error:", error);
    return NextResponse.json(
      { error: "Failed to create account link" },
      { status: 500 }
    );
  }
}
