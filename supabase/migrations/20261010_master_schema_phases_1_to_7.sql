-- ============================================================================
-- AgencyFlow: Master Migration for Phases 1, 2, 3, 4, 5, 6, and 7
-- Run this in Supabase SQL Editor for complete Phase 1-7 setup
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

DO $$ BEGIN
    CREATE TYPE domain_status AS ENUM ('active', 'pending_transfer', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hosting_status AS ENUM ('active', 'suspended', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE renewal_ownership AS ENUM ('agency_billed', 'agency_absorbed', 'client_direct');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'cash', 'cheque', 'wise', 'payoneer', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE expense_type AS ENUM ('operational', 'project');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM (
        'software_subscription',
        'cloud_hosting',
        'office_rent',
        'marketing_ads',
        'equipment_hardware',
        'project_assets',
        'subcontractor_fee',
        'utilities_internet',
        'legal_accounting',
        'travel_meals',
        'other'
    );
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
    FOR EACH ROW EXECUTE FUNCTION public.generate_client_code();

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
    FOR EACH ROW EXECUTE FUNCTION public.generate_project_code();

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

-- 8. Domains Table
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

-- 9. Hosting Services Table
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

-- 10. Invoices Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    exchange_rate_to_base NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    base_total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status invoice_status NOT NULL DEFAULT 'draft',
    notes TEXT,
    payment_terms TEXT,
    issuer_snapshot JSONB,
    client_snapshot JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON public.invoices(due_date);

-- 11. Invoice Items Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_order INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    service_category TEXT NOT NULL DEFAULT 'web_dev',
    quantity NUMERIC(8,2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- 12. Client Payments Table (Cash Inflows - Phase 5)
CREATE TABLE IF NOT EXISTS public.client_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_code TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    exchange_rate_to_base NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
    base_amount NUMERIC(14,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
    reference_number TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_client ON public.client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.client_payments(payment_date);

-- 13. Invoice Payment Allocations Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.invoice_payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    client_payment_id UUID NOT NULL REFERENCES public.client_payments(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(14,2) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(invoice_id, client_payment_id)
);

-- Sequential Generators for Invoices & Payments
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS public.payment_code_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := 'AF-INV-' || current_yr || '-' || LPAD(nextval('public.invoice_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON public.invoices;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

CREATE OR REPLACE FUNCTION public.generate_payment_code()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
    IF NEW.payment_code IS NULL OR NEW.payment_code = '' THEN
        NEW.payment_code := 'REC-' || current_yr || '-' || LPAD(nextval('public.payment_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_payment_code ON public.client_payments;
CREATE TRIGGER trigger_generate_payment_code
    BEFORE INSERT ON public.client_payments
    FOR EACH ROW EXECUTE FUNCTION public.generate_payment_code();

-- 14. Expenses Table (Phase 6)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    expense_type expense_type NOT NULL DEFAULT 'operational',
    category expense_category NOT NULL DEFAULT 'software_subscription',
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    exchange_rate_to_base NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
    base_amount NUMERIC(14,2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
    vendor TEXT,
    reference_number TEXT,
    receipt_url TEXT,
    tax_deductible BOOLEAN NOT NULL DEFAULT true,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

CREATE SEQUENCE IF NOT EXISTS public.expense_code_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_expense_code()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
    IF NEW.expense_code IS NULL OR NEW.expense_code = '' THEN
        NEW.expense_code := 'EXP-' || current_yr || '-' || LPAD(nextval('public.expense_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_expense_code ON public.expenses;
CREATE TRIGGER trigger_generate_expense_code
    BEFORE INSERT ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.generate_expense_code();

-- 15. Team Payments Table (Phase 7)
CREATE TABLE IF NOT EXISTS public.team_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_code TEXT NOT NULL UNIQUE,
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE RESTRICT,
    project_assignment_id UUID REFERENCES public.project_assignments(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    exchange_rate_to_base NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
    base_amount NUMERIC(14,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
    reference_number TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_payments_member ON public.team_payments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_payments_project ON public.team_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_team_payments_date ON public.team_payments(payment_date);

CREATE SEQUENCE IF NOT EXISTS public.team_payment_code_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_team_payment_code()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
    IF NEW.payment_code IS NULL OR NEW.payment_code = '' THEN
        NEW.payment_code := 'TP-' || current_yr || '-' || LPAD(nextval('public.team_payment_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_team_payment_code ON public.team_payments;
CREATE TRIGGER trigger_generate_team_payment_code
    BEFORE INSERT ON public.team_payments
    FOR EACH ROW EXECUTE FUNCTION public.generate_team_payment_code();

-- 16. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_payments ENABLE ROW LEVEL SECURITY;

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

-- Master RLS Policies with Safe DROP IF EXISTS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage agency settings" ON public.agency_settings;
CREATE POLICY "Admins can manage agency settings" ON public.agency_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Authenticated users can read agency settings" ON public.agency_settings;
CREATE POLICY "Authenticated users can read agency settings" ON public.agency_settings FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins have full access to clients" ON public.clients;
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view clients" ON public.clients;
CREATE POLICY "Team members can view clients" ON public.clients FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'team_member')
);

DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Admins have full access to projects" ON public.projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view assigned projects" ON public.projects;
CREATE POLICY "Team members can view assigned projects" ON public.projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.projects.id AND tm.profile_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins have full access to project assignments" ON public.project_assignments;
CREATE POLICY "Admins have full access to project assignments" ON public.project_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view own project assignments" ON public.project_assignments;
CREATE POLICY "Team members can view own project assignments" ON public.project_assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = public.project_assignments.team_member_id AND tm.profile_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins have full access to team members" ON public.team_members;
CREATE POLICY "Admins have full access to team members" ON public.team_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view team directory" ON public.team_members;
CREATE POLICY "Team members can view team directory" ON public.team_members FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins have full access to domains" ON public.domains;
CREATE POLICY "Admins have full access to domains" ON public.domains FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view assigned project domains" ON public.domains;
CREATE POLICY "Team members can view assigned project domains" ON public.domains FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.domains.project_id AND tm.profile_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins have full access to hosting" ON public.hosting_services;
CREATE POLICY "Admins have full access to hosting" ON public.hosting_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view assigned project hosting" ON public.hosting_services;
CREATE POLICY "Team members can view assigned project hosting" ON public.hosting_services FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.hosting_services.project_id AND tm.profile_id = auth.uid()
    )
);

-- Phase 5 Invoices & Payments Policies
DROP POLICY IF EXISTS "Admins have full access to invoices" ON public.invoices;
CREATE POLICY "Admins have full access to invoices" ON public.invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Admins have full access to invoice items" ON public.invoice_items;
CREATE POLICY "Admins have full access to invoice items" ON public.invoice_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Admins have full access to payments" ON public.client_payments;
CREATE POLICY "Admins have full access to payments" ON public.client_payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Admins have full access to allocations" ON public.invoice_payment_allocations;
CREATE POLICY "Admins have full access to allocations" ON public.invoice_payment_allocations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

-- Phase 6 Expenses Policies
DROP POLICY IF EXISTS "Admins have full access to expenses" ON public.expenses;
CREATE POLICY "Admins have full access to expenses" ON public.expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

-- Phase 7 Team Payments Policies
DROP POLICY IF EXISTS "Admins have full access to team payments" ON public.team_payments;
CREATE POLICY "Admins have full access to team payments" ON public.team_payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view own payments" ON public.team_payments;
CREATE POLICY "Team members can view own payments" ON public.team_payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = public.team_payments.team_member_id AND tm.profile_id = auth.uid()
    )
);
