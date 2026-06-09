import Link from "next/link";
import { notFound } from "next/navigation";
import { BillingEmbeddedCheckout } from "@/components/billing/embedded-checkout";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Checkout | Wave",
};

export default function BillingCheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const planId = searchParams.plan as PlanId | undefined;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscribe to {plan.name}</h1>
          <p className="text-muted-foreground">${plan.price}/month</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings/billing">Cancel</Link>
        </Button>
      </div>
      <BillingEmbeddedCheckout planId={plan.id} />
    </div>
  );
}
