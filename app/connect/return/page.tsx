import Link from "next/link";

/**
 * Return URL after Stripe Connect onboarding (Account Links).
 * Stripe redirects here with ?accountId=acct_...
 */
export default function ConnectReturnPage({
  searchParams,
}: {
  searchParams: { accountId?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Onboarding submitted
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Stripe is reviewing your account. Return to the dashboard to check
          your live onboarding status.
        </p>
        {searchParams.accountId && (
          <p className="mt-4 font-mono text-xs text-slate-400">
            {searchParams.accountId}
          </p>
        )}
        <Link
          href="/dashboard/connect"
          className="mt-6 inline-block rounded-md bg-[#534AB7] px-4 py-2 text-sm font-medium text-white hover:bg-[#3C3489]"
        >
          Go to Connect dashboard
        </Link>
      </div>
    </div>
  );
}
