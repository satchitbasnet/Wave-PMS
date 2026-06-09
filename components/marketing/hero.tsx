import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-24 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Building2 className="h-4 w-4" />
          Modern property management
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-slate-50">
          Manage properties, tenants, and leases in one place
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          {APP_NAME} helps landlords and property managers track units, onboard
          tenants, collect rent, and stay organized — without the spreadsheet chaos.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
