-- ============================================================================
-- AgencyFlow: Master Migration for Phases 1, 2, and 3
-- Run this in Supabase SQL Editor for complete Phase 1-3 setup
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'team_member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('lead', 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'freelancer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE assignment_payment_status AS ENUM ('unpaid', 'partially_paid', 'paid');
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

-- Sequence & Trigger for Client Code (CLT-1001)
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

-- 5. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    designation TEXT NOT NULL,
    skills TEXT[],
    employment_type employment_type NOT NULL DEFAULT 'contractor',
    default_rate NUMERIC(14,2) DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    status TEXT NOT NULL DEFAULT 'active',
    bank_account_details TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    technologies TEXT[],
    status project_status NOT NULL DEFAULT 'planning',
    priority project_priority NOT NULL DEFAULT 'medium',
    start_date DATE,
    expected_delivery_date DATE,
    actual_completion_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    contract_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    estimated_costs NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    project_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequence & Trigger for Project Code (PRJ-2026-001)
CREATE SEQUENCE IF NOT EXISTS public.project_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_project_code()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
    IF NEW.project_code IS NULL OR NEW.project_code = '' THEN
        NEW.project_code := 'PRJ-' || current_yr || '-' || LPAD(nextval('public.project_code_seq')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_project_code ON public.projects;
CREATE TRIGGER trigger_generate_project_code
    BEFORE INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_project_code();

-- 7. Project Assignments Table
CREATE TABLE IF NOT EXISTS public.project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE RESTRICT,
    role_in_project TEXT NOT NULL,
    agreed_fee NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (agreed_fee >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    payment_status assignment_payment_status NOT NULL DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, team_member_id)
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Helper Functions
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

-- Policies
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

CREATE POLICY "Admins have full access to projects" ON public.projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

CREATE POLICY "Team members can view assigned projects" ON public.projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.projects.id AND tm.profile_id = auth.uid()
    )
);

CREATE POLICY "Admins have full access to project assignments" ON public.project_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

CREATE POLICY "Admins have full access to team members" ON public.team_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

-- Initial Demo Team Members Seed
INSERT INTO public.team_members (full_name, email, designation, employment_type, default_rate, currency, status)
VALUES 
    ('Kasun Jayasuriya', 'kasun@agencyflow.io', 'Lead Full-Stack Engineer', 'full_time', 150000, 'LKR', 'active'),
    ('Sanduni Wickramasinghe', 'sanduni@agencyflow.io', 'UI/UX & Product Designer', 'contractor', 80000, 'LKR', 'active'),
    ('Naveen Rajaratnam', 'naveen@agencyflow.io', 'DevOps & Cloud Architect', 'freelancer', 60000, 'LKR', 'active')
ON CONFLICT DO NOTHING;
