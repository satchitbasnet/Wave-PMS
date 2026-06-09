import { getStripe } from "@/lib/stripe";

export interface CheckoutSessionStatus {
  status: string | null;
  payment_status: string | null;
  customer_email: string | null;
  plan_id: string | null;
  organization_id: string | null;
}

export async function getCheckoutSessionStatus(
  sessionId: string
): Promise<CheckoutSessionStatus> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  let customerEmail: string | null = session.customer_details?.email ?? null;

  if (session.customer) {
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer.id;

    const customer = await stripe.customers.retrieve(customerId);

    if (!("deleted" in customer && customer.deleted) && customer.email) {
      customerEmail = customer.email;
    }
  }

  return {
    status: session.status,
    payment_status: session.payment_status,
    customer_email: customerEmail,
    plan_id: session.metadata?.plan_id ?? null,
    organization_id: session.metadata?.organization_id ?? null,
  };
}
