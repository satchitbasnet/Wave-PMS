"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge";
import { ScreeningBadge } from "@/components/tenants/screening-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  computeBalanceDue,
  formatCurrency,
  getActiveLease,
  resolveTenantStatus,
  type TenantStatus,
  type TenantWithRelations,
} from "@/lib/tenants";
import type { ScreeningStatus } from "@/lib/tenants";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ label: string; value: TenantStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Delinquent", value: "delinquent" },
  { label: "Former", value: "former" },
];

interface TenantsTableProps {
  tenants: TenantWithRelations[];
}

export function TenantsTable({ tenants }: TenantsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tenants.filter((tenant) => {
      const status = resolveTenantStatus(tenant);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        tenant.full_name.toLowerCase().includes(q) ||
        (tenant.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tenants, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <IconSearch
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              type="button"
              size="sm"
              variant={statusFilter === f.value ? "default" : "outline"}
              className={cn(
                statusFilter === f.value && "bg-[#534AB7] hover:bg-[#3C3489]"
              )}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lease</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Screening</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => {
                const lease = getActiveLease(tenant);
                const unit = lease?.units;
                const status = resolveTenantStatus(tenant);
                const screening = (tenant.screening_status ??
                  "pending") as ScreeningStatus;
                const balance = computeBalanceDue(tenant.payments);

                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenant.full_name}</p>
                        {tenant.email && (
                          <p className="text-xs text-muted-foreground">
                            {tenant.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {unit ? (
                        <span>
                          {unit.unit_number}
                          {unit.properties?.name && (
                            <span className="block text-xs text-muted-foreground">
                              {unit.properties.name}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {lease?.status ?? "—"}
                    </TableCell>
                    <TableCell>
                      {lease?.monthly_rent
                        ? formatCurrency(Number(lease.monthly_rent))
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(balance > 0 && "font-medium text-red-600")}
                    >
                      {formatCurrency(balance)}
                    </TableCell>
                    <TableCell>
                      <ScreeningBadge status={screening} />
                    </TableCell>
                    <TableCell>
                      <TenantStatusBadge status={status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/tenants/${tenant.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
