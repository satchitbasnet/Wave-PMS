import Link from "next/link";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <section className="bg-slate-50 px-4 py-24 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Choose the plan that fits your portfolio. Upgrade anytime.
            </p>
          </div>
          <PricingTable compact />
          <div className="mt-8 text-center">
            <Button variant="link" asChild>
              <Link href="/pricing">Compare all plans →</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 px-8 py-16 text-center text-white dark:bg-slate-100 dark:text-slate-900">
          <h2 className="text-3xl font-bold">Ready to simplify property management?</h2>
          <p className="mt-4 text-slate-300 dark:text-slate-600">
            Join landlords and property managers who trust Wave.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/register">Start your free trial</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
