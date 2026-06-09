import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  planIdFromPriceId,
  planIdFromProductMetadata,
} from "@/lib/stripe-plans";
import { getStripeClient } from "@/lib/stripe/client";
import { requireWebhookSecret } from "@/lib/stripe/config";

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
  const stripeClient = getStripeClient();

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      requireWebhookSecret()
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

      // V2 Connect platform subscriptions use customer_account (acct_...), not customer
      const connectAccountId = subscription.customer_account ?? null;

      if (connectAccountId) {
        await supabaseAdmin
          .from("organizations")
          .update({
            platform_subscription_id: subscription.id,
            platform_subscription_status: subscription.status,
          })
          .eq("stripe_connect_account_id", connectAccountId);

        // Handle upgrades/downgrades: check subscription.items.data[0].price
        const priceId = subscription.items.data[0]?.price?.id;
        console.log(
          "[Webhook] Connect platform subscription updated:",
          connectAccountId,
          subscription.status,
          priceId
        );
        // TODO: Grant/revoke product access based on priceId in your app

        if (subscription.pause_collection) {
          console.log(
            "[Webhook] Subscription collections paused until",
            subscription.pause_collection.resumes_at
          );
        }
        if (subscription.cancel_at_period_end) {
          console.log("[Webhook] Subscription will cancel at period end");
        }
      } else {
        const planId = await resolvePlanFromSubscription(
          stripeClient,
          subscription
        );
        if (subscription.status === "active" && planId) {
          await supabaseAdmin
            .from("organizations")
            .update({
              plan: planId,
              stripe_subscription_id: subscription.id,
            })
            .eq("stripe_subscription_id", subscription.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const connectAccountId = subscription.customer_account ?? null;

      if (connectAccountId) {
        await supabaseAdmin
          .from("organizations")
          .update({
            platform_subscription_id: null,
            platform_subscription_status: "canceled",
          })
          .eq("stripe_connect_account_id", connectAccountId);
        // TODO: Revoke platform features for this connected account
      } else {
        await supabaseAdmin
          .from("organizations")
          .update({ plan: "starter", stripe_subscription_id: null })
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }

    case "payment_method.attached":
    case "payment_method.detached":
    case "customer.updated":
    case "customer.tax_id.created":
    case "customer.tax_id.deleted":
    case "customer.tax_id.updated":
    case "billing_portal.configuration.created":
    case "billing_portal.configuration.updated":
    case "billing_portal.session.created":
      // Log billing portal / payment method events — update DB as needed
      console.log("[Webhook] Billing event:", event.type);
      // TODO: Sync payment method or tax ID changes if you store them locally
      break;
  }

  return NextResponse.json({ received: true });
}
