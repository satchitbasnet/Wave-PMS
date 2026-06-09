import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { createConnectAccount } from "@/lib/stripe/connect";
import {
  getOrgConnectAccountId,
  saveOrgConnectAccountId,
} from "@/lib/stripe/connect-db";

/**
 * POST /api/connect/accounts
 *
 * Step 1 of Connect: Create a V2 connected account and store org → account mapping.
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

    const existing = await getOrgConnectAccountId(user.id);
    if (existing?.connectAccountId) {
      return NextResponse.json({
        accountId: existing.connectAccountId,
        alreadyExists: true,
      });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email, org_id, organizations(name)")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json(
        { error: "Complete organization onboarding first." },
        { status: 400 }
      );
    }

    const org = profile.organizations as { name: string } | { name: string }[] | null;
    const orgName = Array.isArray(org) ? org[0]?.name : org?.name;

    // V2 account creation — display_name + contact_email from the logged-in user
    const account = await createConnectAccount({
      displayName: orgName ?? profile.full_name ?? "Wave",
      contactEmail: profile.email ?? user.email ?? "",
    });

    // Store mapping: organization → Stripe Connect account ID
    await saveOrgConnectAccountId(profile.org_id, account.id);

    return NextResponse.json({ accountId: account.id });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Create Connect account error:", error);
    return NextResponse.json(
      { error: "Failed to create connected account" },
      { status: 500 }
    );
  }
}
