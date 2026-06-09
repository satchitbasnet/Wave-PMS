import { NextResponse } from "next/server";
import type { PlanId } from "@/lib/plans";
import { createSubscriptionCheckoutSession } from "@/lib/stripe-checkout";

export async function POST(request: Request) {
  try {
    const { planId } = (await request.json()) as { planId?: PlanId };

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const { clientSecret } = await createSubscriptionCheckoutSession(planId);

    return NextResponse.json({ clientSecret });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
