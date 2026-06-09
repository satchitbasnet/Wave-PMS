import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  planIdFromPriceId,
  planIdFromProductMetadata,
} from "@/lib/stripe-plans";
import { getStripe } from "@/lib/stripe";

function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function resolvePlanFromSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<string | null> {
  const item = subscription.items.data[0];
  const price = item?.price;

  if (!price) return null;

  const priceId = typeof price === "string" ? price : price.id;
  const fromPrice = planIdFromPriceId(priceId);
  if (fromPrice) return fromPrice;

  if (typeof price !== "string" && price.product) {
    const product =
      typeof price.product === "string"
        ? await stripe.products.retrieve(price.product)
        : price.product;
    if (!product.deleted) {
      return planIdFromProductMetadata(product.metadata);
    }
  }

  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organization_id;
      const planId = session.metadata?.plan_id;

      if (organizationId) {
        await supabaseAdmin
          .from("organizations")
          .update({
            stripe_subscription_id: session.subscription as string,
            plan: planId ?? "starter",
          })
          .eq("id", organizationId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const planId = await resolvePlanFromSubscription(stripe, subscription);

      if (subscription.status === "active" && planId) {
        await supabaseAdmin
          .from("organizations")
          .update({
            plan: planId,
            stripe_subscription_id: subscription.id,
          })
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("organizations")
        .update({ plan: "starter", stripe_subscription_id: null })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
