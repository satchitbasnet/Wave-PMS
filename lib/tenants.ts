import type { Database } from "@/types/database.types";

export type TenantStatus = "active" | "pending" | "delinquent" | "former";
export type ScreeningStatus = "pending" | "approved" | "denied";

type LeaseRow = Pick<
  Database["public"]["Tables"]["leases"]["Row"],
  "id" | "status" | "monthly_rent" | "end_date" | "start_date"
> & {
  units?: {
    unit_number: string;
    properties?: { name: string } | null;
  } | null;
};

type PaymentRow = Pick<
  Database["public"]["Tables"]["payments"]["Row"],
  "amount" | "status" | "type" | "due_date"
>;

export type TenantWithRelations =
  Database["public"]["Tables"]["tenants"]["Row"] & {
    leases?: LeaseRow[] | null;
    payments?: PaymentRow[] | null;
  };

export function getActiveLease(tenant: TenantWithRelations): LeaseRow | null {
  const leases = tenant.leases ?? [];
  return (
    leases.find((l) => l.status === "active") ??
    leases.find((l) => l.status === "draft") ??
    null
  );
}

export function resolveTenantStatus(tenant: TenantWithRelations): TenantStatus {
  if (tenant.status === "delinquent") return "delinquent";
  if (tenant.status === "former") return "former";

  const active = getActiveLease(tenant);
  if (active?.status === "active") return "active";

  const hadLease = (tenant.leases ?? []).some(
    (l) => l.status === "expired" || l.status === "terminated"
  );
  if (hadLease) return "former";

  return tenant.status === "active" ? "active" : "pending";
}

export function computeBalanceDue(payments: PaymentRow[] | null | undefined): number {
  if (!payments?.length) return 0;
  return payments
    .filter(
      (p) =>
        (p.status === "pending" || p.status === "failed") &&
        p.type !== "refund"
    )
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
