import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";

/**
 * Parsed Connect account status from the V2 Accounts API.
 * Always fetched live from Stripe (not cached in DB for this demo).
 */
export interface ConnectAccountStatus {
  accountId: string;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
  cardPaymentsStatus: string | null;
  requirementsStatus: string | null;
  displayName: string | null;
  contactEmail: string | null;
}

/**
 * Step: Retrieve a V2 connected account and derive onboarding / payments readiness.
 *
 * @see https://docs.stripe.com/api/v2/core/accounts/object
 */
export async function getConnectAccountStatus(
  stripeAccountId: string
): Promise<ConnectAccountStatus> {
  const stripeClient = getStripeClient();

  const account = await stripeClient.v2.core.accounts.retrieve(stripeAccountId, {
    include: ["configuration.merchant", "requirements"],
  });

  const readyToProcessPayments =
    account.configuration?.merchant?.capabilities?.card_payments?.status ===
    "active";

  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const onboardingComplete =
    requirementsStatus !== "currently_due" &&
    requirementsStatus !== "past_due";

  return {
    accountId: account.id,
    readyToProcessPayments,
    onboardingComplete,
    cardPaymentsStatus:
      account.configuration?.merchant?.capabilities?.card_payments?.status ??
      null,
    requirementsStatus,
    displayName: account.display_name ?? null,
    contactEmail: account.contact_email ?? null,
  };
}

/**
 * Step: Create a V2 Connect account (Accounts v2 — no top-level `type`).
 *
 * Do NOT pass type: 'express' | 'standard' | 'custom' at the top level.
 */
export async function createConnectAccount(params: {
  displayName: string;
  contactEmail: string;
  country?: string;
}): Promise<Stripe.Response<Stripe.V2.Core.Account>> {
  const stripeClient = getStripeClient();

  return stripeClient.v2.core.accounts.create({
    display_name: params.displayName,
    contact_email: params.contactEmail,
    identity: {
      country: params.country ?? "us",
    },
    dashboard: "full",
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: {
            requested: true,
          },
        },
      },
    },
  });
}

/**
 * Step: Create an Account Link so the user can complete Connect onboarding.
 *
 * @see https://docs.stripe.com/api/v2/core/account-links
 */
export async function createConnectAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  const stripeClient = getStripeClient();

  return stripeClient.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "customer"],
        refresh_url: refreshUrl,
        return_url: returnUrl,
      },
    },
  });
}
