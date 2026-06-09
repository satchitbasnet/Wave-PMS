import { AddTenantDialog } from "@/components/tenants/add-tenant-dialog";
import { TenantsTable } from "@/components/tenants/tenants-table";
import { createClient } from "@/lib/supabase/server";
import type { TenantWithRelations } from "@/lib/tenants";

export const metadata = { title: "Tenants | Wave" };

export default async function TenantsPage() {
  const supabase = createClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(
      `
      *,
      leases (
        id,
        status,
        monthly_rent,
        start_date,
        end_date,
        units (
          unit_number,
          properties ( name )
        )
      ),
      payments ( amount, status, type, due_date )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load tenants:", error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            View and manage tenant profiles, leases, and payments.
          </p>
        </div>
        <AddTenantDialog />
      </div>

      <TenantsTable tenants={(tenants as TenantWithRelations[]) ?? []} />
    </div>
  );
}
