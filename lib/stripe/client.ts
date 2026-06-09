import Stripe from "stripe";
import { requireSecretKey } from "@/lib/stripe/config";

/**
 * Singleton Stripe Client — use for ALL server-side Stripe requests.
 *
 * Example (equivalent across SDKs):
 *   const stripeClient = new Stripe('sk_***')
 *
 * We read the key from STRIPE_SECRET_KEY instead of hardcoding it.
 * API version is managed automatically by the Stripe Node SDK.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireSecretKey(), {
      typescript: true,
    });
  }
  return stripeClient;
}

/** @deprecated Use getStripeClient — kept for existing imports */
export const getStripe = getStripeClient;
