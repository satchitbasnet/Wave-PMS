"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConnectStatus {
  hasAccount: boolean;
  accountId?: string;
  readyToProcessPayments?: boolean;
  onboardingComplete?: boolean;
  cardPaymentsStatus?: string | null;
  requirementsStatus?: string | null;
  displayName?: string | null;
  contactEmail?: string | null;
}

/**
 * Connect onboarding UI — create account, start onboarding, show live API status.
 */
export function ConnectOnboarding() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect/accounts/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load status");
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function createAccount() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect/accounts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create account");
      await fetchStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create account");
    } finally {
      setActionLoading(false);
    }
  }

  async function startOnboarding() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect/account-links", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create link");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start onboarding");
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>
            Create a connected account and complete onboarding to accept payments
            from your customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.hasAccount ? (
            <Button onClick={createAccount} disabled={actionLoading || loading}>
              {actionLoading ? "Creating…" : "Create connected account"}
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={startOnboarding}
                disabled={actionLoading || loading}
                className="bg-[#534AB7] hover:bg-[#3C3489]"
              >
                {actionLoading
                  ? "Redirecting…"
                  : "Onboard to collect payments"}
              </Button>
              <Button variant="outline" onClick={fetchStatus} disabled={loading}>
                Refresh status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {status?.hasAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>
              Fetched live from the Stripe Accounts API (not cached in the
              database).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Account ID</dt>
                <dd className="font-mono text-xs">{status.accountId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Display name</dt>
                <dd>{status.displayName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Card payments</dt>
                <dd>
                  <StatusBadge
                    ok={status.readyToProcessPayments}
                    label={status.cardPaymentsStatus ?? "unknown"}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Onboarding</dt>
                <dd>
                  <StatusBadge
                    ok={status.onboardingComplete}
                    label={
                      status.onboardingComplete ? "complete" : "incomplete"
                    }
                  />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Requirements</dt>
                <dd>{status.requirementsStatus ?? "—"}</dd>
              </div>
            </dl>

            {status.readyToProcessPayments && status.accountId && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/connect/products">Manage products</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/connect/subscription">
                    Platform subscription
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  {/* Demo uses acct_ in URL — use a friendly slug in production */}
                  <Link href={`/store/${status.accountId}`} target="_blank">
                    View storefront
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        ok
          ? "bg-green-100 text-green-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {label}
    </span>
  );
}
