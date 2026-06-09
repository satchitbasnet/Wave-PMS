import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  compact?: boolean;
}

export function PricingTable({ compact = false }: PricingTableProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        compact ? "sm:grid-cols-3" : "mx-auto max-w-6xl sm:grid-cols-3"
      )}
    >
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative flex flex-col border-slate-200 dark:border-slate-800",
            "popular" in plan &&
              plan.popular &&
              "border-slate-900 shadow-lg dark:border-slate-100"
          )}
        >
          {"popular" in plan && plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900">
              Most popular
            </div>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={"popular" in plan && plan.popular ? "default" : "outline"}
              asChild
            >
              <Link href={`/register?plan=${plan.id}`}>Get started</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
