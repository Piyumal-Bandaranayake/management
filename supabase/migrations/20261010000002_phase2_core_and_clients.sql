-- ============================================================================
-- Phase 2: Core Foundation & Client Management Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Client status enum
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Agency Settings Table (Single-row configuration for the agency)
CREATE TABLE IF NOT EXISTS public.agency_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_name TEXT NOT NULL DEFAULT 'AgencyFlow',
    legal_name TEXT,
    tagline TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT NOT NULL DEFAULT 'contact@agencyflow.io',
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    country TEXT NOT NULL DEFAULT 'Sri Lanka',
    base_currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    tax_identifier TEXT,
    default_tax_rate NUMERIC(5,2) DEFAULT 0.00,
    invoice_prefix TEXT NOT NULL DEFAULT 'AF-INV-',
    client_prefix TEXT NOT NULL DEFAULT 'CLT-',
    project_prefix TEXT NOT NULL DEFAULT 'PRJ-',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial settings row if none exists
INSERT INTO public.agency_settings (agency_name, base_currency)
SELECT 'AgencyFlow', 'LKR'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_settings);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    company_name TEXT,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    city TEXT,
    country TEXT NOT NULL DEFAULT 'Sri Lanka',
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    tax_number TEXT,
    status client_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for rapid searching and sorting
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_code ON public.clients(client_code);

-- 4. Automatic Sequential Client Code Generator
CREATE SEQUENCE IF NOT EXISTS public.client_code_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_code IS NULL OR NEW.client_code = '' THEN
        NEW.client_code := 'CLT-' || LPAD(nextval('public.client_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_client_code ON public.clients;
CREATE TRIGGER trigger_generate_client_code
    BEFORE INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_client_code();

-- 5. Row Level Security (RLS)
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Agency Settings Policies:
CREATE POLICY "Admins can manage agency settings"
    ON public.agency_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Authenticated users can read agency settings"
    ON public.agency_settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Clients Policies:
-- Super Admins and Admins can perform ALL actions on clients
CREATE POLICY "Admins have full access to clients"
    ON public.clients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

-- Team members can read active clients
CREATE POLICY "Team members can view clients"
    ON public.clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'team_member'
        )
    );
