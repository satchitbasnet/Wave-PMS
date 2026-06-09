import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata = {
  title: "Pricing | PropFlow",
  description: "Simple, transparent pricing for property managers of all sizes.",
};

export default function PricingPage() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>
        <PricingTable />
      </div>
    </section>
  );
}
