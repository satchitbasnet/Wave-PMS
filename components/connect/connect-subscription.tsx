"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Platform subscription for connected accounts — uses customer_account (V2).
 */
export function ConnectSubscription() {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading("checkout");
    setError(null);
    try {
      const res = await fetch("/api/connect/platform-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(null);
    }
  }

  async function openBillingPortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/connect/billing-portal", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Platform subscription
          </h1>
          <p className="text-muted-foreground">
            Subscribe your connected account to Wave platform billing.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/connect">← Back to Connect</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscribe</CardTitle>
          <CardDescription>
            Hosted Checkout with{" "}
            <code className="text-xs">customer_account: acct_...</code>. Set{" "}
            <code className="text-xs">STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID</code>{" "}
            in .env.local to your platform price ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={startCheckout}
            disabled={loading !== null}
            className="bg-[#534AB7] hover:bg-[#3C3489]"
          >
            {loading === "checkout" ? "Redirecting…" : "Subscribe via Checkout"}
          </Button>
          <Button
            variant="outline"
            onClick={openBillingPortal}
            disabled={loading !== null}
          >
            {loading === "portal" ? "Redirecting…" : "Manage billing"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook sync</CardTitle>
          <CardDescription>
            Subscription status is stored in{" "}
            <code className="text-xs">organizations.platform_subscription_*</code>{" "}
            when <code className="text-xs">customer.subscription.*</code> events
            arrive at <code className="text-xs">/api/stripe/webhook</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use <code className="text-xs">subscription.customer_account</code> (not{" "}
          <code className="text-xs">customer</code>) to identify V2 connected
          accounts.
        </CardContent>
      </Card>
    </div>
  );
}
