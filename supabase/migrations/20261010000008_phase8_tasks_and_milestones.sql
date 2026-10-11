-- ============================================================================
-- AgencyFlow Migration: Phase 8 - Tasks, Milestones & Kanban Sprint Tracking
-- ============================================================================

-- 1. Create Helper Function if not exists
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Enums if they do not exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

-- 3. Project Milestones Table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completion_date DATE,
    order_index INT NOT NULL DEFAULT 1,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Project Tasks Table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    due_date DATE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'project', 'task', 'milestone', 'client', 'invoice', 'payment', 'team'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'completed', 'deleted'
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Indexes for High-Performance Kanban Querying
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone_id ON public.project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON public.project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_team_member ON public.project_tasks(assigned_team_member_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- 7. Updated Timestamp Trigger for Tasks
CREATE OR REPLACE FUNCTION update_project_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_project_task_timestamp ON public.project_tasks;
CREATE TRIGGER trg_update_project_task_timestamp
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_task_timestamp();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 9. Idempotent RLS Policies

-- Milestones Policies
DROP POLICY IF EXISTS "Admins have full access to project_milestones" ON public.project_milestones;
CREATE POLICY "Admins have full access to project_milestones"
ON public.project_milestones FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Assigned members can view milestones" ON public.project_milestones;
CREATE POLICY "Assigned members can view milestones"
ON public.project_milestones FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.project_milestones.project_id
        AND tm.profile_id = auth.uid()
    )
);

-- Tasks Policies
DROP POLICY IF EXISTS "Admins have full access to project_tasks" ON public.project_tasks;
CREATE POLICY "Admins have full access to project_tasks"
ON public.project_tasks FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Team members can view assigned project tasks" ON public.project_tasks;
CREATE POLICY "Team members can view assigned project tasks"
ON public.project_tasks FOR SELECT
USING (
    assigned_to = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.project_assignments pa
        JOIN public.team_members tm ON tm.id = pa.team_member_id
        WHERE pa.project_id = public.project_tasks.project_id
        AND tm.profile_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Team members can update their assigned tasks status" ON public.project_tasks;
CREATE POLICY "Team members can update their assigned tasks status"
ON public.project_tasks FOR UPDATE
USING (
    assigned_to = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = public.project_tasks.assigned_team_member_id
        AND tm.profile_id = auth.uid()
    )
);

-- Activity Logs Policies
DROP POLICY IF EXISTS "Admins have full access to activity_logs" ON public.activity_logs;
CREATE POLICY "Admins have full access to activity_logs"
ON public.activity_logs FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS "Users can view relevant activity logs" ON public.activity_logs;
CREATE POLICY "Users can view relevant activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() IS NOT NULL);
