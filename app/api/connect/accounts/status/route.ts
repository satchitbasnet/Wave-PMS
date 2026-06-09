import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { getConnectAccountStatus } from "@/lib/stripe/connect";
import { getOrgConnectAccountId } from "@/lib/stripe/connect-db";

/**
 * GET /api/connect/accounts/status
 *
 * Always fetches live status from the Stripe Accounts API (not from DB).
 */
export async function GET() {
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
      return NextResponse.json({ hasAccount: false });
    }

    const status = await getConnectAccountStatus(mapping.connectAccountId);

    return NextResponse.json({ hasAccount: true, ...status });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Connect status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch account status" },
      { status: 500 }
    );
  }
}
