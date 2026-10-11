-- ============================================================================
-- Phase 3: Project Management & Team Assignments Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Project & Team Enums
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

-- 2. Team Members Table
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

-- 3. Projects Table
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

-- Indexes for Projects
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(project_code);

-- 4. Project Assignments Table
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

CREATE INDEX IF NOT EXISTS idx_assignments_project ON public.project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_team ON public.project_assignments(team_member_id);

-- 5. Automatic Sequential Project Code Generator (PRJ-2026-001)
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

-- 6. Row Level Security Policies
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Team Members RLS
CREATE POLICY "Admins have full access to team members"
    ON public.team_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Team members can view own profile or colleague names"
    ON public.team_members
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Projects RLS
-- Admins have full access to all projects
CREATE POLICY "Admins have full access to projects"
    ON public.projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

-- Team members can ONLY view projects they are assigned to
CREATE POLICY "Team members can view assigned projects"
    ON public.projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_assignments pa
            JOIN public.team_members tm ON tm.id = pa.team_member_id
            WHERE pa.project_id = public.projects.id AND tm.profile_id = auth.uid()
        )
    );

-- Assignments RLS
CREATE POLICY "Admins have full access to project assignments"
    ON public.project_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Team members can view own project assignments"
    ON public.project_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.id = public.project_assignments.team_member_id AND tm.profile_id = auth.uid()
        )
    );
