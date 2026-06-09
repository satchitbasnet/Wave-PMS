import { loadStripe } from "@stripe/stripe-js";

// Load once outside components — see https://docs.stripe.com/keys-best-practices
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;
