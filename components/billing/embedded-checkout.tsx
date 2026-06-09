"use client";

import { useCallback } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import type { PlanId } from "@/lib/plans";

interface BillingEmbeddedCheckoutProps {
  planId: PlanId;
}

export function BillingEmbeddedCheckout({ planId }: BillingEmbeddedCheckoutProps) {
  const fetchClientSecret = useCallback(async () => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Failed to start checkout");
    }
    return data.clientSecret as string;
  }, [planId]);

  if (!stripePromise) {
    return (
      <p className="text-sm text-destructive">
        Stripe publishable key is not configured. Set{" "}
        <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in{" "}
        <code className="text-xs">.env.local</code>.
      </p>
    );
  }

  return (
    <div className="min-h-[480px] w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
