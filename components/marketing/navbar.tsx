import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
          <Building2 className="h-6 w-6" />
          PropFlow
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-400">
          <Link href="/#features" className="hover:text-slate-900 dark:hover:text-slate-200">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-200">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
