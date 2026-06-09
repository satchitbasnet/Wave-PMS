/**
 * Stripe configuration helpers.
 *
 * Never put API keys in source code — use environment variables.
 * @see https://docs.stripe.com/keys-best-practices
 */

export class StripeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeConfigError";
  }
}

/** Throws a helpful error if STRIPE_SECRET_KEY is missing. */
export function requireSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new StripeConfigError(
      "STRIPE_SECRET_KEY is not set. Add your secret key to .env.local " +
        "(Dashboard → Developers → API keys). Never commit this value to git."
    );
  }
  return key;
}

/** Throws if the platform subscription price ID placeholder is still unset. */
export function requirePlatformSubscriptionPriceId(): string {
  const priceId = process.env.STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID?.trim();
  if (!priceId || priceId.startsWith("price_...")) {
    throw new StripeConfigError(
      "STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID is not set. Create a platform " +
        "subscription Price in the Stripe Dashboard and add its price_ ID to .env.local."
    );
  }
  return priceId;
}

/** Thin-event webhook secret (separate destination in Stripe Dashboard). */
export function requireConnectWebhookSecret(): string {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new StripeConfigError(
      "STRIPE_CONNECT_WEBHOOK_SECRET is not set. Create a thin-event destination " +
        "for connected accounts and run: stripe listen --thin-events '...' " +
        "--forward-thin-to http://localhost:3000/api/stripe/webhook/connect"
    );
  }
  return secret;
}

/** Standard (snapshot) webhook secret for platform billing events. */
export function requireWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new StripeConfigError(
      "STRIPE_WEBHOOK_SECRET is not set. Run: stripe listen --forward-to " +
        "http://localhost:3000/api/stripe/webhook"
    );
  }
  return secret;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}
