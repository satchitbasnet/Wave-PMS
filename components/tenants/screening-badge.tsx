import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScreeningStatus } from "@/lib/tenants";

const STYLES: Record<ScreeningStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  denied: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function ScreeningBadge({
  status,
  className,
}: {
  status: ScreeningStatus;
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
