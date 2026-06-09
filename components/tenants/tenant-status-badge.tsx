import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TenantStatus } from "@/lib/tenants";

const STYLES: Record<TenantStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  delinquent: "bg-red-100 text-red-800 hover:bg-red-100",
  former: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

export function TenantStatusBadge({
  status,
  className,
}: {
  status: TenantStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize font-medium", STYLES[status], className)}
    >
      {status}
    </Badge>
  );
}
