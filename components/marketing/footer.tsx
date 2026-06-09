import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
          <Building2 className="h-5 w-5" />
          PropFlow
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PropFlow. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-200">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-200">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
