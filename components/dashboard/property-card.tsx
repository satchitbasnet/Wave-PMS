import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnitStatusChip } from "@/components/dashboard/unit-status-chip";

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  unitCount?: number;
  occupiedCount?: number;
  vacantCount?: number;
}

export function PropertyCard({
  id,
  name,
  address,
  city,
  state,
  unitCount = 0,
  occupiedCount = 0,
  vacantCount = 0,
}: PropertyCardProps) {
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <Link href={`/dashboard/properties/${id}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <UnitStatusChip
              status={vacantCount > 0 ? "vacant" : "occupied"}
            />
          </div>
          <CardTitle className="text-lg group-hover:text-slate-700 dark:group-hover:text-slate-200">
            {name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {address}
              {location ? `, ${location}` : ""}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{unitCount} units</span>
            <span>{occupiedCount} occupied</span>
            <span>{vacantCount} vacant</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
