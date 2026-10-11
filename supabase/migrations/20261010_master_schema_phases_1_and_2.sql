-- ============================================================================
-- AgencyFlow: Master Migration for Phases 1 & 2
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'team_member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'team_member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Agency Settings Table
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

INSERT INTO public.agency_settings (agency_name, base_currency)
SELECT 'AgencyFlow', 'LKR'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_settings);

-- 4. Clients Table
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

-- Sequence & Trigger for Sequential Client Code (CLT-1001, CLT-1002, ...)
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

-- 5. Helper Functions for Roles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
    assigned_role user_role;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    IF user_count = 0 THEN
        assigned_role := 'super_admin';
    ELSE
        assigned_role := 'team_member';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        assigned_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Agency Settings Policies
DROP POLICY IF EXISTS "Admins can manage agency settings" ON public.agency_settings;
CREATE POLICY "Admins can manage agency settings" ON public.agency_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Authenticated users can read agency settings" ON public.agency_settings;
CREATE POLICY "Authenticated users can read agency settings" ON public.agency_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- Clients Policies
DROP POLICY IF EXISTS "Admins have full access to clients" ON public.clients;
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view clients" ON public.clients;
CREATE POLICY "Team members can view clients" ON public.clients FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'team_member')
);

-- Initial Demo Clients Seed
INSERT INTO public.clients (client_code, name, company_name, contact_person, email, phone, currency, status, notes)
VALUES 
    ('CLT-1001', 'BrandVision Lanka', 'BrandVision (Pvt) Ltd', 'Kavinda Perera', 'kavinda@brandvision.lk', '+94 77 123 4567', 'LKR', 'active', 'Corporate web portal and annual hosting client.'),
    ('CLT-1002', 'EcoFoods Ceylon', 'EcoFoods Exports Ltd', 'Dilani Fernando', 'dilani@ecofoods.com', '+94 11 234 5678', 'LKR', 'active', 'E-Commerce store with payment gateway.'),
    ('CLT-1003', 'Apex Global Consulting', 'Apex Global UK', 'Oliver Smith', 'oliver@apexconsult.co.uk', '+44 20 7946 0912', 'USD', 'active', 'International B2B client billed in USD.')
ON CONFLICT (client_code) DO NOTHING;
