import type { PlanId } from "@/lib/plans";
import { PLANS } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createSubscriptionCheckoutSession(planId: PlanId) {
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan?.priceId) {
    throw new Error("Invalid plan or missing Stripe price ID");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id, organizations!users_org_id_fkey(stripe_customer_id)")
    .eq("id", user.id)
    .single();

  const organization = profile?.organizations as
    | { stripe_customer_id: string | null }
    | { stripe_customer_id: string | null }[]
    | null;

  let customerId = Array.isArray(organization)
    ? organization[0]?.stripe_customer_id
    : organization?.stripe_customer_id;

  const stripe = getStripe();

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
        organization_id: profile?.org_id ?? "",
      },
    });
    customerId = customer.id;

    if (profile?.org_id) {
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", profile.org_id);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    ui_mode: "embedded_page",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    return_url: `${appUrl}/dashboard/settings/billing/return?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      plan_id: plan.id,
      organization_id: profile?.org_id ?? "",
    },
  });

  if (!session.client_secret) {
    throw new Error("Checkout session missing client secret");
  }

  return { clientSecret: session.client_secret, sessionId: session.id };
}
