-- Stripe Connect: map organizations to V2 connected accounts + platform subscription state

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS platform_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_subscription_status TEXT NOT NULL DEFAULT 'inactive';

COMMENT ON COLUMN public.organizations.stripe_connect_account_id IS
  'Stripe Connect V2 account ID (acct_...) for this organization';

COMMENT ON COLUMN public.organizations.platform_subscription_status IS
  'Platform SaaS subscription status for the connected account (active, canceled, etc.)';
