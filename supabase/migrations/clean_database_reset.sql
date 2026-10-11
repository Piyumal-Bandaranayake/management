-- ============================================================================
-- AgencyFlow: Complete Database Cleanup Script
-- Wipes all dummy data, resets sequences, preserves all tables & RLS policies
-- ============================================================================

-- 1. Ensure trigger on auth.users is removed so new admin users can be added cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Truncate all data tables cleanly (CASCADE handles all foreign key relationships)
TRUNCATE TABLE 
    public.activity_logs,
    public.project_tasks,
    public.project_milestones,
    public.team_payments,
    public.expenses,
    public.invoice_payment_allocations,
    public.client_payments,
    public.invoice_items,
    public.invoices,
    public.domains,
    public.hosting_services,
    public.project_assignments,
    public.projects,
    public.team_members,
    public.clients,
    public.profiles
CASCADE;

-- 3. Reset Code Generating Sequences to initial clean counters
ALTER SEQUENCE IF EXISTS public.client_code_seq RESTART WITH 1001;
ALTER SEQUENCE IF EXISTS public.project_code_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.invoice_number_seq RESTART WITH 1001;
ALTER SEQUENCE IF EXISTS public.payment_code_seq RESTART WITH 1001;
ALTER SEQUENCE IF EXISTS public.expense_code_seq RESTART WITH 1001;
ALTER SEQUENCE IF EXISTS public.team_payment_code_seq RESTART WITH 1001;

-- 4. Re-initialize Default Agency Settings (if not already set)
INSERT INTO public.agency_settings (
    agency_name,
    legal_name,
    tagline,
    email,
    country,
    base_currency,
    invoice_prefix,
    client_prefix,
    project_prefix
)
VALUES (
    'AgencyFlow',
    'AgencyFlow Digital Lab',
    'Enterprise Agency Management OS',
    'contact@agencyflow.io',
    'Sri Lanka',
    'LKR',
    'AF-INV-',
    'CLT-',
    'PRJ-'
)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 
    'clients' AS table_name, count(*) AS record_count FROM public.clients
UNION ALL
SELECT 'projects', count(*) FROM public.projects
UNION ALL
SELECT 'invoices', count(*) FROM public.invoices
UNION ALL
SELECT 'expenses', count(*) FROM public.expenses
UNION ALL
SELECT 'team_members', count(*) FROM public.team_members
UNION ALL
SELECT 'project_tasks', count(*) FROM public.project_tasks
UNION ALL
SELECT 'agency_settings', count(*) FROM public.agency_settings;
