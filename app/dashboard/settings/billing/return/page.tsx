import { CheckoutReturn } from "@/components/billing/checkout-return";

export const metadata = {
  title: "Subscription confirmed | PropFlow",
};

export default function BillingReturnPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return <CheckoutReturn sessionId={searchParams.session_id ?? null} />;
}
