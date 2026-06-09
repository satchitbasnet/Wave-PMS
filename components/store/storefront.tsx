"use client";

import { useCallback, useEffect, useState } from "react";

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  default_price:
    | string
    | { id: string; unit_amount: number | null; currency: string }
    | null;
}

interface StorefrontProps {
  /** Connected account ID (acct_...) — use a friendly slug in production */
  accountId: string;
}

/**
 * Public storefront — lists products and starts hosted Checkout (direct charge).
 */
export function Storefront({ accountId }: StorefrontProps) {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/store/${accountId}/products`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load products");
      setProducts(data.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function buy(product: StripeProduct) {
    const dp = product.default_price;
    const priceId = typeof dp === "string" ? dp : dp?.id;
    if (!priceId) {
      setError("Product has no price");
      return;
    }

    setBuyingId(product.id);
    setError(null);
    try {
      const res = await fetch("/api/connect/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, priceId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBuyingId(null);
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Store</h1>
          <p className="mt-1 text-sm text-slate-600">
            Powered by Stripe Connect — direct charges to the connected account.
          </p>
          {/* In production, replace accountId in the URL with your own store slug */}
          <p className="mt-2 font-mono text-xs text-slate-400">
            account: {accountId}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-600">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-slate-600">No products available yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-1 flex-1 text-sm text-slate-600">
                    {product.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#534AB7]">
                    {formatPrice(product)}
                  </span>
                  <button
                    type="button"
                    onClick={() => buy(product)}
                    disabled={buyingId === product.id}
                    className="rounded-md bg-[#534AB7] px-4 py-2 text-sm font-medium text-white hover:bg-[#3C3489] disabled:opacity-50"
                  >
                    {buyingId === product.id ? "Redirecting…" : "Buy now"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
