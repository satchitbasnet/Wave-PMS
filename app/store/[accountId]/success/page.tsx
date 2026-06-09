import Link from "next/link";

/**
 * Checkout success page after a direct charge on the connected account.
 */
export default function StoreSuccessPage({
  params,
  searchParams,
}: {
  params: { accountId: string };
  searchParams: { session_id?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <h1 className="text-xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for your purchase.
        </p>
        {searchParams.session_id && (
          <p className="mt-4 font-mono text-xs text-slate-400">
            Session: {searchParams.session_id}
          </p>
        )}
        <Link
          href={`/store/${params.accountId}`}
          className="mt-6 inline-block rounded-md bg-[#534AB7] px-4 py-2 text-sm font-medium text-white hover:bg-[#3C3489]"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
