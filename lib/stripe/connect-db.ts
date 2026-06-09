import { createClient } from "@/lib/supabase/server";

/**
 * Persist the mapping from your user/org → Stripe Connect account ID.
 *
 * organizations.stripe_connect_account_id stores the acct_... value.
 */
export async function getOrgConnectAccountId(
  userId: string
): Promise<{ orgId: string; connectAccountId: string | null } | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("org_id, organizations(stripe_connect_account_id)")
    .eq("id", userId)
    .single();

  if (!profile?.org_id) return null;

  const org = profile.organizations as
    | { stripe_connect_account_id: string | null }
    | { stripe_connect_account_id: string | null }[]
    | null;

  const connectAccountId = Array.isArray(org)
    ? org[0]?.stripe_connect_account_id ?? null
    : org?.stripe_connect_account_id ?? null;

  return { orgId: profile.org_id, connectAccountId };
}

export async function saveOrgConnectAccountId(
  orgId: string,
  connectAccountId: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("organizations")
    .update({ stripe_connect_account_id: connectAccountId })
    .eq("id", orgId);

  if (error) throw new Error(error.message);
}

export async function updatePlatformSubscription(
  connectAccountId: string,
  data: {
    platform_subscription_id?: string | null;
    platform_subscription_status?: string;
  }
) {
  const supabase = createClient();

  // TODO: If you add a dedicated connect_accounts table, update that instead.
  const { error } = await supabase
    .from("organizations")
    .update(data)
    .eq("stripe_connect_account_id", connectAccountId);

  if (error) throw new Error(error.message);
}
