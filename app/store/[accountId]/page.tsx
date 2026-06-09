import { Storefront } from "@/components/store/storefront";

/**
 * Public storefront for a connected account.
 *
 * NOTE: This demo uses the Stripe account ID (acct_...) in the URL.
 * In production, map a friendly store slug → connect account ID in your DB.
 */
export default function StorePage({
  params,
}: {
  params: { accountId: string };
}) {
  return <Storefront accountId={params.accountId} />;
}
