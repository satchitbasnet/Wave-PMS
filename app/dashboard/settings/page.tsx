import Link from "next/link";
import { IconChevronRight, IconCreditCard } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your organization.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing & subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <IconCreditCard className="h-5 w-5 text-muted-foreground" stroke={1.75} />
              <span>Manage plan and payments</span>
            </div>
            <IconChevronRight className="h-4 w-4 text-muted-foreground" stroke={1.75} />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
