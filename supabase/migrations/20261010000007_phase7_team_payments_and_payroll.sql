-- ============================================================================
-- Phase 7: Team Payments, Contractor Payouts & Payroll Tracking Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Team Payments Table
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

-- 2. Automatic Sequential Team Payment Code Generator
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

-- 3. Row Level Security Policies
ALTER TABLE public.team_payments ENABLE ROW LEVEL SECURITY;

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
