-- PropFlow initial schema (Phase 1)
-- Run in Supabase SQL Editor or via supabase db push

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter', 'growth', 'pro', 'enterprise')),
  unit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'manager', 'tenant', 'vendor')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial', 'hoa', 'student')),
  unit_count INTEGER NOT NULL DEFAULT 0,
  year_built INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Units
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3, 1),
  sqft INTEGER,
  rent_amount NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'vacant'
    CHECK (status IN ('vacant', 'occupied', 'maintenance', 'listed')),
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, unit_number)
);

-- Tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  ssn_last4 TEXT,
  emergency_contact JSONB,
  screening_status TEXT DEFAULT 'pending'
    CHECK (screening_status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leases
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(10, 2) NOT NULL,
  security_deposit NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
  signed_at TIMESTAMPTZ,
  document_url TEXT,
  renewal_offered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (granular permissions per user per org)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL
    CHECK (role IN ('owner', 'manager', 'tenant', 'vendor', 'accountant')),
  property_ids UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);
CREATE INDEX IF NOT EXISTS idx_properties_org_id ON public.properties(org_id);
CREATE INDEX IF NOT EXISTS idx_units_property_id ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_org_id ON public.tenants(org_id);
CREATE INDEX IF NOT EXISTS idx_leases_unit_id ON public.leases(unit_id);
CREATE INDEX IF NOT EXISTS idx_roles_user_org ON public.roles(user_id, org_id);

-- Helpers
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Signup: create org + user profile + owner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
BEGIN
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    split_part(NEW.email, '@', 1) || '''s Organization'
  );

  INSERT INTO public.organizations (name, slug)
  VALUES (
    org_name,
    lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8)
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.users (id, org_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner'
  );

  INSERT INTO public.roles (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY "org_select_member" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id());
CREATE POLICY "org_update_owner" ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id() AND public.current_user_role() = 'owner');

-- Users
CREATE POLICY "users_select_same_org" ON public.users FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "users_update_self" ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "users_update_owner" ON public.users FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() = 'owner');

-- Properties
CREATE POLICY "properties_select_org" ON public.properties FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "properties_write_manager" ON public.properties FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'));

-- Units
CREATE POLICY "units_select_org" ON public.units FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = units.property_id AND p.org_id = public.current_org_id()
  ));
CREATE POLICY "units_write_manager" ON public.units FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = units.property_id AND p.org_id = public.current_org_id()
  ) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.org_id = public.current_org_id()
  ) AND public.current_user_role() IN ('owner', 'manager'));

-- Tenants
CREATE POLICY "tenants_select_org" ON public.tenants FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "tenants_write_manager" ON public.tenants FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() IN ('owner', 'manager'));

-- Leases
CREATE POLICY "leases_select_org" ON public.leases FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON p.id = u.property_id
    WHERE u.id = leases.unit_id AND p.org_id = public.current_org_id()
  ));
CREATE POLICY "leases_write_manager" ON public.leases FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON p.id = u.property_id
    WHERE u.id = leases.unit_id AND p.org_id = public.current_org_id()
  ) AND public.current_user_role() IN ('owner', 'manager'))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON p.id = u.property_id
    WHERE u.id = unit_id AND p.org_id = public.current_org_id()
  ) AND public.current_user_role() IN ('owner', 'manager'));

-- Roles
CREATE POLICY "roles_select_org" ON public.roles FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "roles_write_owner" ON public.roles FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.current_user_role() = 'owner')
  WITH CHECK (org_id = public.current_org_id() AND public.current_user_role() = 'owner');
