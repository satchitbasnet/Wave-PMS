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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  default_price:
    | string
    | { id: string; unit_amount: number | null; currency: string }
    | null;
}

/**
 * Create and list products on the connected account (Stripe-Account header).
 */
export function ConnectProducts() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await fetch("/api/connect/accounts/status");
      const statusData = await statusRes.json();
      if (!statusRes.ok) throw new Error(statusData.error);
      if (!statusData.hasAccount) {
        setError("Create a connected account first.");
        return;
      }
      setAccountId(statusData.accountId);

      const res = await fetch("/api/connect/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load products");
      setProducts(data.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const priceInCents = Math.round(parseFloat(price) * 100);
      if (Number.isNaN(priceInCents) || priceInCents <= 0) {
        throw new Error("Enter a valid price");
      }

      const res = await fetch("/api/connect/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          priceInCents,
          currency: "usd",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create product");

      setName("");
      setDescription("");
      setPrice("");
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  function formatPrice(product: StripeProduct) {
    const dp = product.default_price;
    if (!dp || typeof dp === "string") return "—";
    const amount = (dp.unit_amount ?? 0) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: dp.currency,
    }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect products</h1>
          <p className="text-muted-foreground">
            Products are created on your connected account via the Stripe-Account
            header.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/connect">← Back to Connect</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create product</CardTitle>
          <CardDescription>
            Uses{" "}
            <code className="text-xs">stripeClient.products.create(..., {"{"}{" "}
            stripeAccount {"}"})</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create product"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your products</CardTitle>
          {accountId && (
            <CardDescription>
              Storefront:{" "}
              <Link
                href={`/store/${accountId}`}
                className="text-[#534AB7] underline"
                target="_blank"
              >
                /store/{accountId}
              </Link>
              {" "}
              (use a friendly slug in production)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                  <span className="font-semibold">{formatPrice(p)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
