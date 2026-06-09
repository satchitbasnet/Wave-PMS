"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and payment details.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg border border-slate-200 p-6 dark:border-slate-800"
          >
            <h3 className="font-semibold">{plan.name}</h3>
            <p className="mt-1 text-2xl font-bold">${plan.price}/mo</p>
            <Button className="mt-4 w-full" asChild>
              <Link href={`/dashboard/settings/billing/checkout?plan=${plan.id}`}>
                Subscribe
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
