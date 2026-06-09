"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addTenantNote } from "@/lib/actions/tenants";
import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge";
import { ScreeningBadge } from "@/components/tenants/screening-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  type TenantWithRelations,
} from "@/lib/tenants";
import type { ScreeningStatus } from "@/lib/tenants";
import type { Database } from "@/types/database.types";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type NoteRow = Database["public"]["Tables"]["tenant_notes"]["Row"] & {
  users?: { full_name: string | null } | null;
};

interface TenantDetailProps {
  tenant: TenantWithRelations;
  payments: PaymentRow[];
  notes: NoteRow[];
}

export function TenantDetail({ tenant, payments, notes }: TenantDetailProps) {
  const router = useRouter();
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const initials = tenant.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeLease = getActiveLease(tenant);
  const status = resolveTenantStatus(tenant);
  const screening = (tenant.screening_status ?? "pending") as ScreeningStatus;
  const emergency = tenant.emergency_contact as {
    name?: string;
    phone?: string;
    relationship?: string;
  } | null;

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    setSavingNote(true);
    const result = await addTenantNote(tenant.id, noteBody);
    setSavingNote(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Note added");
    setNoteBody("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-[#EEEDFE] text-lg text-[#3C3489]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tenant.full_name}</h1>
            <p className="text-muted-foreground">{tenant.email ?? "No email"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <TenantStatusBadge status={status} />
              <ScreeningBadge status={screening} />
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/tenants">← Back to tenants</Link>
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="lease">Active lease</TabsTrigger>
          <TabsTrigger value="payments">Payment history</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" value={tenant.phone} />
              <Field
                label="Date of birth"
                value={
                  tenant.date_of_birth
                    ? new Date(tenant.date_of_birth).toLocaleDateString()
                    : null
                }
              />
              <Field label="Screening" value={screening} />
              <Field
                label="Balance due"
                value={formatCurrency(computeBalanceDue(payments))}
              />
              <Separator className="col-span-full" />
              <div className="col-span-full">
                <p className="text-sm font-medium">Emergency contact</p>
                {emergency?.name ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {emergency.name}
                    {emergency.relationship && ` (${emergency.relationship})`}
                    {emergency.phone && ` · ${emergency.phone}`}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Not set</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lease" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active lease</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLease ? (
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Field label="Status" value={activeLease.status} />
                  <Field
                    label="Unit"
                    value={
                      activeLease.units
                        ? `${activeLease.units.unit_number}${
                            activeLease.units.properties?.name
                              ? ` · ${activeLease.units.properties.name}`
                              : ""
                          }`
                        : null
                    }
                  />
                  <Field
                    label="Monthly rent"
                    value={formatCurrency(Number(activeLease.monthly_rent))}
                  />
                  <Field
                    label="Start date"
                    value={new Date(activeLease.start_date).toLocaleDateString()}
                  />
                  <Field
                    label="End date"
                    value={
                      activeLease.end_date
                        ? new Date(activeLease.end_date).toLocaleDateString()
                        : "Open-ended"
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active lease.{" "}
                  <Link
                    href="/dashboard/leases"
                    className="text-[#534AB7] underline"
                  >
                    Create a lease
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.paid_at
                            ? new Date(p.paid_at).toLocaleDateString()
                            : p.due_date
                              ? new Date(p.due_date).toLocaleDateString()
                              : "—"}
                        </TableCell>
                        <TableCell className="capitalize">{p.type}</TableCell>
                        <TableCell>{formatCurrency(Number(p.amount))}</TableCell>
                        <TableCell className="capitalize">{p.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Manager note…"
                  className="flex-1"
                />
                <Button type="submit" disabled={savingNote || !noteBody.trim()}>
                  {savingNote ? "Saving…" : "Add"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li key={note.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <p className="text-sm">{note.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.users?.full_name ?? "Staff"} ·{" "}
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Lease PDFs and uploaded documents will appear here in the lease
              module (Phase 2 Step 08).
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <Label className="text-muted-foreground">{label}</Label>
      <p className="mt-1 text-sm capitalize">{value ?? "—"}</p>
    </div>
  );
}
