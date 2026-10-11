-- ============================================================================
-- Phase 1: Profiles & Role-Based Access Control Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define system roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'team_member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table linking to auth.users
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: get current calling user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies for profiles
-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2. Super admins and admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
        )
    );

-- 3. Users can update their own personal info (name, avatar, phone)
CREATE POLICY "Users can update own details"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Super admin can update any profile (including role promotion/demotion)
CREATE POLICY "Super admin can update any profile"
    ON public.profiles
    FOR UPDATE
    USING (public.is_super_admin());

-- Trigger to automatically create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
    assigned_role user_role;
BEGIN
    -- Check how many profiles exist. First registered user becomes super_admin automatically!
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

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
