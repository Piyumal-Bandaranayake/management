-- ============================================================================
-- Phase 6: Financial Management, Expenses & Cash Flow Ledger Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums for Expenses
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

-- 2. Expenses Table
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

-- 3. Automatic Sequential Expense Code Generator
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

-- 4. Row Level Security Policies
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to expenses" ON public.expenses;
CREATE POLICY "Admins have full access to expenses" ON public.expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);
