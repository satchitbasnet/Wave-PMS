import { notFound } from "next/navigation";
import { TenantDetail } from "@/components/tenants/tenant-detail";
import { createClient } from "@/lib/supabase/server";
import type { TenantWithRelations } from "@/lib/tenants";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("tenants")
    .select("full_name")
    .eq("id", params.id)
    .single();

  return {
    title: data?.full_name ? `${data.full_name} | Tenants` : "Tenant detail",
  };
}

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: tenant, error } = await supabase
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
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !tenant) {
    notFound();
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", params.id)
    .order("created_at", { ascending: false });

  const { data: notes } = await supabase
    .from("tenant_notes")
    .select("*, users ( full_name )")
    .eq("tenant_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <TenantDetail
      tenant={tenant as TenantWithRelations}
      payments={payments ?? []}
      notes={notes ?? []}
    />
  );
}
