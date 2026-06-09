"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBuilding,
  IconCalculator,
  IconChartBar,
  IconDoor,
  IconFileText,
  IconHome,
  IconSettings,
  IconSpeakerphone,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";
import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDashboardUser } from "@/components/dashboard/user-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Overview", href: "/dashboard", icon: IconHome, exact: true },
  { title: "Properties", href: "/dashboard/properties", icon: IconBuilding },
  { title: "Units", href: "/dashboard/units", icon: IconDoor },
  { title: "Tenants", href: "/dashboard/tenants", icon: IconUsers },
  { title: "Leases", href: "/dashboard/leases", icon: IconFileText },
  { title: "Maintenance", href: "/dashboard/maintenance", icon: IconTool },
  { title: "Accounting", href: "/dashboard/accounting", icon: IconCalculator },
  { title: "Marketing", href: "/dashboard/marketing", icon: IconSpeakerphone },
  { title: "Reports", href: "/dashboard/reports", icon: IconChartBar },
  { title: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useDashboardUser();

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PF";

  return (
    <Sidebar className="w-60 border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <IconHome className="h-5 w-5 text-[#534AB7]" stroke={1.75} />
          <span>PropFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        isActive &&
                          "bg-[#EEEDFE] text-[#3C3489] hover:bg-[#EEEDFE] hover:text-[#3C3489]"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" stroke={1.75} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-200 text-xs text-slate-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.fullName ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Sign out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
