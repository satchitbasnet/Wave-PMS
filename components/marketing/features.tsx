import { BarChart3, Building2, FileText, Users } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: Building2,
    title: "Property & unit tracking",
    description:
      "Organize your portfolio with real-time unit status, rent amounts, and occupancy at a glance.",
  },
  {
    icon: Users,
    title: "Tenant management",
    description:
      "Store tenant profiles, lease history, and contact info in one secure, searchable place.",
  },
  {
    icon: FileText,
    title: "Lease lifecycle",
    description:
      "Track active, pending, and expired leases with automated reminders before renewal dates.",
  },
  {
    icon: BarChart3,
    title: "Portfolio insights",
    description:
      "See vacancy rates, revenue projections, and property performance across your organization.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Everything you need to run your portfolio
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Built for solo landlords and growing property management teams.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <feature.icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
