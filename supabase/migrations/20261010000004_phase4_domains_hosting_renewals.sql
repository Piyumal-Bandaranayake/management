-- ============================================================================
-- Phase 4: Domains, Hosting & Technical Renewals Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums for Asset Management
DO $$ BEGIN
    CREATE TYPE domain_status AS ENUM ('active', 'pending_transfer', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hosting_status AS ENUM ('active', 'suspended', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE renewal_ownership AS ENUM ('agency_billed', 'agency_absorbed', 'client_direct');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Domains Table
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL,
    registrar TEXT NOT NULL,
    registration_date DATE,
    expiration_date DATE NOT NULL,
    renewal_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (renewal_cost >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    renewal_ownership renewal_ownership NOT NULL DEFAULT 'agency_billed',
    status domain_status NOT NULL DEFAULT 'active',
    dns_records_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domains_expiration ON public.domains(expiration_date);
CREATE INDEX IF NOT EXISTS idx_domains_client ON public.domains(client_id);
CREATE INDEX IF NOT EXISTS idx_domains_project ON public.domains(project_id);

-- 3. Hosting Services Table
CREATE TABLE IF NOT EXISTS public.hosting_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    server_reference TEXT,
    start_date DATE,
    expiration_date DATE NOT NULL,
    renewal_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (renewal_cost >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    billing_cycle TEXT NOT NULL DEFAULT 'yearly',
    renewal_ownership renewal_ownership NOT NULL DEFAULT 'agency_billed',
    status hosting_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hosting_expiration ON public.hosting_services(expiration_date);
CREATE INDEX IF NOT EXISTS idx_hosting_client ON public.hosting_services(client_id);
CREATE INDEX IF NOT EXISTS idx_hosting_project ON public.hosting_services(project_id);

-- 4. Row Level Security Policies
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_services ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins have full access to domains"
    ON public.domains FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Team members can view assigned project domains"
    ON public.domains FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_assignments pa
            JOIN public.team_members tm ON tm.id = pa.team_member_id
            WHERE pa.project_id = public.domains.project_id AND tm.profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins have full access to hosting"
    ON public.hosting_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Team members can view assigned project hosting"
    ON public.hosting_services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_assignments pa
            JOIN public.team_members tm ON tm.id = pa.team_member_id
            WHERE pa.project_id = public.hosting_services.project_id AND tm.profile_id = auth.uid()
        )
    );
