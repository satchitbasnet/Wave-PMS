"use client";

import { usePathname } from "next/navigation";
import { IconBell, IconMenu2, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  properties: "Properties",
  units: "Units",
  tenants: "Tenants",
  leases: "Leases",
  maintenance: "Maintenance",
  accounting: "Accounting",
  marketing: "Marketing",
  reports: "Reports",
  settings: "Settings",
  onboarding: "Onboarding",
  billing: "Billing",
};

export function TopNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments[segments.length - 1] ?? "dashboard";
  const label = LABELS[current] ?? current;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <SidebarTrigger className="md:hidden">
        <IconMenu2 className="h-5 w-5" stroke={1.75} />
      </SidebarTrigger>
      <nav className="hidden text-sm text-muted-foreground md:block">
        <span>Dashboard</span>
        {current !== "dashboard" && (
          <>
            <span className="mx-2">/</span>
            <span className="text-foreground">{label}</span>
          </>
        )}
      </nav>
      <div className="flex-1" />
      <div className="relative hidden w-64 md:block">
        <IconSearch
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          stroke={1.75}
        />
        <Input placeholder="Search..." className="h-9 pl-8" />
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <IconBell className="h-5 w-5" stroke={1.75} />
      </Button>
    </header>
  );
}
