"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionStatus {
  status: string;
  payment_status: string | null;
  customer_email: string | null;
  plan_id: string | null;
}

interface CheckoutReturnProps {
  sessionId: string | null;
}

export function CheckoutReturn({ sessionId }: CheckoutReturnProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      if (!sessionId) {
        setError("Missing checkout session.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load session");
        }

        setSession(data);

        if (data.status === "open") {
          const plan = data.plan_id ?? "starter";
          router.replace(
            `/dashboard/settings/billing/checkout?plan=${encodeURIComponent(plan)}`
          );
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-muted-foreground">
        <IconLoader2 className="h-8 w-8 animate-spin" stroke={1.5} />
        <p>Confirming your subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <Card>
          <CardHeader>
            <CardTitle>Checkout error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/dashboard/settings/billing">Back to billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.status === "complete") {
    return (
      <div className="mx-auto max-w-lg py-8">
        <Card>
          <CardHeader className="text-center">
            <IconCircleCheck
              className="mx-auto mb-2 h-12 w-12 text-emerald-600"
              stroke={1.5}
            />
            <CardTitle>Subscription active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-muted-foreground">
            <p>
              {session.plan_id
                ? `Your ${session.plan_id} plan is now active.`
                : "Your subscription is now active."}
            </p>
            {session.customer_email && (
              <p className="text-sm">
                Confirmation sent to{" "}
                <span className="font-medium text-foreground">
                  {session.customer_email}
                </span>
              </p>
            )}
            <Button asChild>
              <Link href="/dashboard/settings/billing">Back to billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-muted-foreground">
          <p>Session status: {session?.status ?? "unknown"}</p>
          <Button asChild>
            <Link href="/dashboard/settings/billing">Back to billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
