-- ============================================================================
-- Phase 5: Invoicing Engine, Line Items & Client Payments Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums for Invoicing & Payments
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'cash', 'cheque', 'wise', 'payoneer', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Invoices Table
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

-- 3. Invoice Items Table
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

-- 4. Client Payments (Cash Inflows)
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

-- 5. Invoice Payment Allocations
CREATE TABLE IF NOT EXISTS public.invoice_payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    client_payment_id UUID NOT NULL REFERENCES public.client_payments(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(14,2) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(invoice_id, client_payment_id)
);

-- 6. Automatic Sequential Number Generators
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

-- 7. Row Level Security Policies
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payment_allocations ENABLE ROW LEVEL SECURITY;

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
