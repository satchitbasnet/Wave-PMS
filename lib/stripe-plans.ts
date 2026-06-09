import type { PlanId } from "@/lib/plans";

/** Maps Stripe Price IDs (POST /v1/prices) to PropFlow plan slugs. */
export function getPriceIdToPlanMap(): Record<string, PlanId> {
  const map: Record<string, PlanId> = {};

  if (process.env.STRIPE_PRICE_STARTER) {
    map[process.env.STRIPE_PRICE_STARTER] = "starter";
  }
  if (process.env.STRIPE_PRICE_GROWTH) {
    map[process.env.STRIPE_PRICE_GROWTH] = "growth";
  }
  if (process.env.STRIPE_PRICE_PRO) {
    map[process.env.STRIPE_PRICE_PRO] = "pro";
  }

  return map;
}

export function planIdFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  return getPriceIdToPlanMap()[priceId] ?? null;
}

export function planIdFromProductMetadata(
  metadata: Record<string, string> | null | undefined
): PlanId | null {
  const planId = metadata?.plan_id;
  if (planId === "starter" || planId === "growth" || planId === "pro") {
    return planId;
  }
  return null;
}
