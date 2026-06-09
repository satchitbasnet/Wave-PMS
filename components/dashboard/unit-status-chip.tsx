import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  vacant: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  occupied: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  maintenance: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  listed: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
} as const;

type UnitStatus = keyof typeof STATUS_STYLES;

interface UnitStatusChipProps {
  status: UnitStatus;
  className?: string;
}

export function UnitStatusChip({ status, className }: UnitStatusChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize font-medium", STATUS_STYLES[status], className)}
    >
      {status}
    </Badge>
  );
}
