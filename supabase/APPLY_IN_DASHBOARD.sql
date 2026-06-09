-- =============================================================================
-- PropFlow: paste this ENTIRE file into Supabase SQL Editor and click RUN
-- Open: https://supabase.com/dashboard/project/ussrnqblowtugrjyxqfc/sql/new
-- =============================================================================

-- Migration 002: Stripe Connect columns
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS platform_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_subscription_status TEXT NOT NULL DEFAULT 'inactive';

-- Migration 003: Phase 2 core operations (see migrations/003_core_operations.sql)
-- Tenant operational status
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active', 'pending', 'delinquent', 'former'));

ALTER TABLE public.leases
  ADD COLUMN IF NOT EXISTS late_fee_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rent', 'late_fee', 'deposit', 'refund')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  categories TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1) CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  photos TEXT[] DEFAULT '{}',
  cost NUMERIC(10, 2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('move_in', 'move_out', 'annual', 'drive_by')),
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('move_in', 'move_out', 'annual', 'drive_by')),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  template_id UUID REFERENCES public.inspection_templates(id) ON DELETE SET NULL,
  checklist_data JSONB DEFAULT '{}',
  pdf_url TEXT,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  monthly_income NUMERIC(10, 2),
  employer TEXT,
  move_in_date DATE,
  occupants INTEGER,
  pets BOOLEAN NOT NULL DEFAULT false,
  consent_to_screen BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'screening', 'approved', 'denied', 'withdrawn')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_lease_id ON public.payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_due ON public.payments(status, due_date);
CREATE INDEX IF NOT EXISTS idx_vendors_org_id ON public.vendors(org_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_property_id ON public.work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_inspections_unit_id ON public.inspections(unit_id);
CREATE INDEX IF NOT EXISTS idx_applicants_org_id ON public.applicants(org_id);
CREATE INDEX IF NOT EXISTS idx_tenant_notes_tenant_id ON public.tenant_notes(tenant_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_org" ON public.payments;
CREATE POLICY "payments_select_org" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = payments.tenant_id AND t.org_id = public.current_org_id()));
DROP POLICY IF EXISTS "payments_write_manager" ON public.payments;
CREATE POLICY "payments_write_manager" ON public.payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = payments.tenant_id AND t.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "vendors_select_org" ON public.vendors;
CREATE POLICY "vendors_select_org" ON public.vendors FOR SELECT TO authenticated USING (org_id = public.current_org_id());
DROP POLICY IF EXISTS "vendors_write_manager" ON public.vendors;
CREATE POLICY "vendors_write_manager" ON public.vendors FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "work_orders_select_org" ON public.work_orders;
CREATE POLICY "work_orders_select_org" ON public.work_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = work_orders.property_id AND p.org_id = public.current_org_id()));
DROP POLICY IF EXISTS "work_orders_write_manager" ON public.work_orders;
CREATE POLICY "work_orders_write_manager" ON public.work_orders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = work_orders.property_id AND p.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "inspection_templates_select_org" ON public.inspection_templates;
CREATE POLICY "inspection_templates_select_org" ON public.inspection_templates FOR SELECT TO authenticated USING (org_id = public.current_org_id());
DROP POLICY IF EXISTS "inspection_templates_write_manager" ON public.inspection_templates;
CREATE POLICY "inspection_templates_write_manager" ON public.inspection_templates FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "inspections_select_org" ON public.inspections;
CREATE POLICY "inspections_select_org" ON public.inspections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON p.id = u.property_id WHERE u.id = inspections.unit_id AND p.org_id = public.current_org_id()));
DROP POLICY IF EXISTS "inspections_write_manager" ON public.inspections;
CREATE POLICY "inspections_write_manager" ON public.inspections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON p.id = u.property_id WHERE u.id = inspections.unit_id AND p.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON p.id = u.property_id WHERE u.id = unit_id AND p.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "applicants_select_org" ON public.applicants;
CREATE POLICY "applicants_select_org" ON public.applicants FOR SELECT TO authenticated USING (org_id = public.current_org_id());
DROP POLICY IF EXISTS "applicants_write_manager" ON public.applicants;
CREATE POLICY "applicants_write_manager" ON public.applicants FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "tenant_notes_select_org" ON public.tenant_notes;
CREATE POLICY "tenant_notes_select_org" ON public.tenant_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_notes.tenant_id AND t.org_id = public.current_org_id()));
DROP POLICY IF EXISTS "tenant_notes_write_manager" ON public.tenant_notes;
CREATE POLICY "tenant_notes_write_manager" ON public.tenant_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_notes.tenant_id AND t.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.org_id = public.current_org_id()) AND public.current_user_role() IN ('owner', 'manager'));

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
