import { Building2, DollarSign, Home, Users } from "lucide-react";
import { PropertyCard } from "@/components/dashboard/property-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | Wave",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, address, city, state, units(id, status)")
    .order("created_at", { ascending: false })
    .limit(6);

  const allUnits =
    properties?.flatMap((p) => p.units ?? []) ?? [];
  const occupiedUnits = allUnits.filter((u) => u.status === "occupied").length;
  const vacantUnits = allUnits.filter((u) => u.status === "vacant").length;

  const stats = [
    {
      title: "Properties",
      value: properties?.length ?? 0,
      icon: Building2,
    },
    {
      title: "Total units",
      value: allUnits.length,
      icon: Home,
    },
    {
      title: "Occupied",
      value: occupiedUnits,
      icon: Users,
    },
    {
      title: "Vacant",
      value: vacantUnits,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your property portfolio
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Your properties</h2>
        {properties && properties.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const units = property.units ?? [];
              return (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  address={property.address}
                  city={property.city}
                  state={property.state}
                  unitCount={units.length}
                  occupiedCount={units.filter((u) => u.status === "occupied").length}
                  vacantCount={units.filter((u) => u.status === "vacant").length}
                />
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No properties yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first property to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
