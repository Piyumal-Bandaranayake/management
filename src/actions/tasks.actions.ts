"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  taskFormSchema,
  milestoneFormSchema,
  type TaskFormValues,
  type MilestoneFormValues,
} from "@/lib/validations/task.schema"
import type {
  ProjectTask,
  ProjectMilestone,
  ActivityLog,
  TaskStatSummary,
  TaskFilterOptions,
  TaskStatus,
} from "@/types/task.types"

let DEMO_MILESTONES: ProjectMilestone[] = [
  {
    id: "mls-001",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    title: "M1: Architecture & Design System Tokens",
    description: "Database schemas, security policies, typography tokens and client portal wireframes.",
    target_date: "2026-10-15",
    completion_date: "2026-10-14",
    order_index: 1,
    is_completed: true,
    tasks_count: 2,
    completed_tasks_count: 2,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "mls-002",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    title: "M2: Client Intake Portal & Bank Auth",
    description: "Multi-step consultation questionnaire, secure document upload, and bank gateway integration.",
    target_date: "2026-10-28",
    completion_date: null,
    order_index: 2,
    is_completed: false,
    tasks_count: 3,
    completed_tasks_count: 0,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "mls-003",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    title: "M1: Catalog Engine & Cart Architecture",
    description: "High-speed product grid, currency converter, and basket persistence.",
    target_date: "2026-10-20",
    completion_date: "2026-10-19",
    order_index: 1,
    is_completed: true,
    tasks_count: 2,
    completed_tasks_count: 2,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "mls-004",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    title: "M2: Payment Gateway & Order Fulfillment",
    description: "PayHere integration, IPN webhook handling, and automated PDF invoice generation.",
    target_date: "2026-11-05",
    completion_date: null,
    order_index: 2,
    is_completed: false,
    tasks_count: 2,
    completed_tasks_count: 0,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "mls-005",
    project_id: "prj-003",
    project_name: "Pulse Fitness Member App",
    title: "M1: Member Dashboard & QR Check-in",
    description: "Real-time class booking and dynamic member QR code badge for turnstile access.",
    target_date: "2026-11-15",
    completion_date: null,
    order_index: 1,
    is_completed: false,
    tasks_count: 2,
    completed_tasks_count: 0,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
]

let DEMO_TASKS: ProjectTask[] = [
  {
    id: "tsk-001",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    project_code: "PRJ-2026-0001",
    milestone_id: "mls-001",
    milestone_title: "M1: Architecture & Design System Tokens",
    title: "Set up PostgreSQL Schema & RLS Policies",
    description: "Write atomic migration scripts with security definer functions for multi-tenant isolation.",
    status: "done",
    priority: "urgent",
    assigned_team_member_id: "tm-001",
    assigned_team_member_name: "Kasun Jayasuriya",
    due_date: "2026-10-12",
    order_index: 1,
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "tsk-002",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    project_code: "PRJ-2026-0001",
    milestone_id: "mls-001",
    milestone_title: "M1: Architecture & Design System Tokens",
    title: "Design System Tokens & High-Fidelity Mockups",
    description: "Build component library in Figma using enterprise dark/light palette tokens.",
    status: "done",
    priority: "high",
    assigned_team_member_id: "tm-002",
    assigned_team_member_name: "Sanduni Wickramasinghe",
    due_date: "2026-10-14",
    order_index: 2,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "tsk-003",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    project_code: "PRJ-2026-0001",
    milestone_id: "mls-002",
    milestone_title: "M2: Client Intake Portal & Bank Auth",
    title: "Implement Multi-Step Client Consultation Intake Form",
    description: "React Hook Form + Zod schema validation with automatic draft state caching in localStorage.",
    status: "in_progress",
    priority: "urgent",
    assigned_team_member_id: "tm-001",
    assigned_team_member_name: "Kasun Jayasuriya",
    due_date: "2026-10-22",
    order_index: 3,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-004",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    project_code: "PRJ-2026-0001",
    milestone_id: "mls-002",
    milestone_title: "M2: Client Intake Portal & Bank Auth",
    title: "Client Legal Document Upload Security & S3 Presigned URLs",
    description: "Ensure file size limit (15MB), MIME verification, and encrypted presigned URLs for client confidentiality.",
    status: "in_review",
    priority: "high",
    assigned_team_member_id: "tm-003",
    assigned_team_member_name: "Naveen Rajaratnam",
    due_date: "2026-10-24",
    order_index: 4,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-005",
    project_id: "prj-001",
    project_name: "Apex Law Corporate Portal",
    project_code: "PRJ-2026-0001",
    milestone_id: "mls-002",
    milestone_title: "M2: Client Intake Portal & Bank Auth",
    title: "Integrate Commercial Bank Direct IPG Sandbox",
    description: "Connect payment initiation handshake and verify callback checksum verification algorithm.",
    status: "todo",
    priority: "medium",
    assigned_team_member_id: "tm-001",
    assigned_team_member_name: "Kasun Jayasuriya",
    due_date: "2026-10-28",
    order_index: 5,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-006",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    project_code: "PRJ-2026-0002",
    milestone_id: "mls-003",
    milestone_title: "M1: Catalog Engine & Cart Architecture",
    title: "Product Catalog Filtering with Turbopack App Router",
    description: "Implement URL search query state persistence for category, organic certifications, and weight filters.",
    status: "done",
    priority: "high",
    assigned_team_member_id: "tm-001",
    assigned_team_member_name: "Kasun Jayasuriya",
    due_date: "2026-10-18",
    order_index: 1,
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "tsk-007",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    project_code: "PRJ-2026-0002",
    milestone_id: "mls-003",
    milestone_title: "M1: Catalog Engine & Cart Architecture",
    title: "Design Ceylon Tea & Spices Packaging Banners",
    description: "High-resolution product hero renders with vibrant organic badges and nutritional badges.",
    status: "done",
    priority: "medium",
    assigned_team_member_id: "tm-002",
    assigned_team_member_name: "Sanduni Wickramasinghe",
    due_date: "2026-10-19",
    order_index: 2,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "tsk-008",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    project_code: "PRJ-2026-0002",
    milestone_id: "mls-004",
    milestone_title: "M2: Payment Gateway & Order Fulfillment",
    title: "Setup PayHere IPN Webhook Listener & Stock Reservation",
    description: "Verify MD5 signature security, atomically decrease warehouse stock, and trigger receipt email.",
    status: "in_progress",
    priority: "urgent",
    assigned_team_member_id: "tm-003",
    assigned_team_member_name: "Naveen Rajaratnam",
    due_date: "2026-10-25",
    order_index: 3,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-009",
    project_id: "prj-002",
    project_name: "Ceylon Organic Export E-Commerce",
    project_code: "PRJ-2026-0002",
    milestone_id: "mls-004",
    milestone_title: "M2: Payment Gateway & Order Fulfillment",
    title: "SMS Order Confirmation with Notify.lk Integration",
    description: "Dispatch automated SMS to local customers upon payment dispatch.",
    status: "backlog",
    priority: "low",
    assigned_team_member_id: "tm-003",
    assigned_team_member_name: "Naveen Rajaratnam",
    due_date: "2026-11-02",
    order_index: 4,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-010",
    project_id: "prj-003",
    project_name: "Pulse Fitness Member App",
    project_code: "PRJ-2026-0003",
    milestone_id: "mls-005",
    milestone_title: "M1: Member Dashboard & QR Check-in",
    title: "PWA Viewport & Bottom Navigation Optimization",
    description: "Design mobile-first thumb-friendly navigation bar and install banner prompt.",
    status: "in_progress",
    priority: "medium",
    assigned_team_member_id: "tm-002",
    assigned_team_member_name: "Sanduni Wickramasinghe",
    due_date: "2026-10-30",
    order_index: 1,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "tsk-011",
    project_id: "prj-003",
    project_name: "Pulse Fitness Member App",
    project_code: "PRJ-2026-0003",
    milestone_id: "mls-005",
    milestone_title: "M1: Member Dashboard & QR Check-in",
    title: "Member QR Code Scanner Component with HTML5 Canvas",
    description: "High-speed optical camera scanner decoding member JWT pass token in under 200ms.",
    status: "todo",
    priority: "high",
    assigned_team_member_id: "tm-001",
    assigned_team_member_name: "Kasun Jayasuriya",
    due_date: "2026-11-05",
    order_index: 2,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

let DEMO_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-001",
    user_name: "Kasun Jayasuriya",
    entity_type: "task",
    entity_id: "tsk-003",
    action: "status_changed",
    details: { from: "todo", to: "in_progress", task_title: "Multi-Step Client Intake Form" },
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "act-002",
    user_name: "Sanduni Wickramasinghe",
    entity_type: "task",
    entity_id: "tsk-002",
    action: "completed",
    details: { task_title: "Design System Tokens & High-Fidelity Mockups" },
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: "act-003",
    user_name: "Naveen Rajaratnam",
    entity_type: "task",
    entity_id: "tsk-008",
    action: "status_changed",
    details: { from: "todo", to: "in_progress", task_title: "PayHere IPN Webhook Listener" },
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
]

export async function getTasksAction(filters?: TaskFilterOptions): Promise<{
  success: boolean
  tasks: ProjectTask[]
}> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("project_tasks")
      .select(`
        *,
        projects ( id, name, project_code ),
        project_milestones ( id, title ),
        team_members ( id, full_name )
      `)
      .order("order_index", { ascending: true })

    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId)
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }
    if (filters?.priority && filters.priority !== "all") {
      query = query.eq("priority", filters.priority)
    }
    if (filters?.assigneeId) {
      query = query.eq("assigned_team_member_id", filters.assigneeId)
    }
    if (filters?.milestoneId) {
      query = query.eq("milestone_id", filters.milestoneId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_TASKS]
      if (filters?.projectId) {
        filtered = filtered.filter((t) => t.project_id === filters.projectId)
      }
      if (filters?.status && filters.status !== "all") {
        filtered = filtered.filter((t) => t.status === filters.status)
      }
      if (filters?.priority && filters.priority !== "all") {
        filtered = filtered.filter((t) => t.priority === filters.priority)
      }
      if (filters?.assigneeId) {
        filtered = filtered.filter((t) => t.assigned_team_member_id === filters.assigneeId)
      }
      if (filters?.milestoneId) {
        filtered = filtered.filter((t) => t.milestone_id === filters.milestoneId)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.project_name && t.project_name.toLowerCase().includes(q)) ||
            (t.assigned_team_member_name && t.assigned_team_member_name.toLowerCase().includes(q))
        )
      }
      return { success: true, tasks: filtered }
    }

    const formatted: ProjectTask[] = data.map((item: any) => ({
      ...item,
      project_name: item.projects?.name,
      project_code: item.projects?.project_code,
      milestone_title: item.project_milestones?.title,
      assigned_team_member_name: item.team_members?.full_name,
    }))

    return { success: true, tasks: formatted }
  } catch {
    let filtered = [...DEMO_TASKS]
    if (filters?.projectId) {
      filtered = filtered.filter((t) => t.project_id === filters.projectId)
    }
    return { success: true, tasks: filtered }
  }
}

export async function getTasksByProjectIdAction(projectId: string) {
  return getTasksAction({ projectId })
}

export async function getMilestonesByProjectIdAction(projectId: string): Promise<{
  success: boolean
  milestones: ProjectMilestone[]
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("project_milestones")
      .select(`
        *,
        projects ( id, name ),
        project_tasks ( id, status )
      `)
      .eq("project_id", projectId)
      .order("order_index", { ascending: true })

    if (error || !data || data.length === 0) {
      const filtered = DEMO_MILESTONES.filter((m) => m.project_id === projectId)
      return { success: true, milestones: filtered }
    }

    const formatted: ProjectMilestone[] = data.map((item: any) => {
      const tasks = item.project_tasks || []
      const completed = tasks.filter((t: any) => t.status === "done").length
      return {
        ...item,
        project_name: item.projects?.name,
        tasks_count: tasks.length,
        completed_tasks_count: completed,
      }
    })

    return { success: true, milestones: formatted }
  } catch {
    const filtered = DEMO_MILESTONES.filter((m) => m.project_id === projectId)
    return { success: true, milestones: filtered }
  }
}

export async function createTaskAction(rawData: TaskFormValues) {
  const validated = taskFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid task details",
    }
  }

  const {
    project_id,
    milestone_id,
    title,
    description,
    status,
    priority,
    assigned_team_member_id,
    due_date,
  } = validated.data

  try {
    const supabase = await createClient()
    const { data: newTask, error } = await supabase
      .from("project_tasks")
      .insert({
        project_id,
        milestone_id: milestone_id || null,
        title,
        description: description || null,
        status,
        priority,
        assigned_team_member_id: assigned_team_member_id || null,
        due_date: due_date || null,
        order_index: DEMO_TASKS.length + 1,
      })
      .select()
      .single()

    if (!error && newTask) {
      revalidatePath("/projects/tasks")
      revalidatePath(`/projects/${project_id}`)
      return { success: true, taskId: newTask.id }
    }
  } catch (err) {
    console.error("Database error creating task, applying locally:", err)
  }

  const memberNames: Record<string, string> = {
    "tm-001": "Kasun Jayasuriya",
    "tm-002": "Sanduni Wickramasinghe",
    "tm-003": "Naveen Rajaratnam",
  }
  const projectNames: Record<string, string> = {
    "prj-001": "Apex Law Corporate Portal",
    "prj-002": "Ceylon Organic Export E-Commerce",
    "prj-003": "Pulse Fitness Member App",
  }

  const localTask: ProjectTask = {
    id: `tsk-${Date.now()}`,
    project_id,
    project_name: projectNames[project_id] || "Selected Project",
    milestone_id: milestone_id || null,
    milestone_title: milestone_id ? "Project Milestone" : null,
    title,
    description: description || null,
    status,
    priority,
    assigned_team_member_id: assigned_team_member_id || null,
    assigned_team_member_name: assigned_team_member_id ? memberNames[assigned_team_member_id] || "Team Member" : null,
    due_date: due_date || null,
    order_index: DEMO_TASKS.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  DEMO_TASKS = [localTask, ...DEMO_TASKS]
  revalidatePath("/projects/tasks")
  revalidatePath(`/projects/${project_id}`)

  return { success: true, taskId: localTask.id }
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  try {
    const supabase = await createClient()
    await supabase
      .from("project_tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId)
  } catch (err) {
    console.error("Database error updating task status:", err)
  }

  DEMO_TASKS = DEMO_TASKS.map((t) =>
    t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
  )

  const updated = DEMO_TASKS.find((t) => t.id === taskId)
  if (updated) {
    DEMO_ACTIVITY_LOGS = [
      {
        id: `act-${Date.now()}`,
        user_name: "Operations Lead",
        entity_type: "task",
        entity_id: taskId,
        action: newStatus === "done" ? "completed" : "status_changed",
        details: { task_title: updated.title, new_status: newStatus },
        created_at: new Date().toISOString(),
      },
      ...DEMO_ACTIVITY_LOGS,
    ]
  }

  revalidatePath("/projects/tasks")
  if (updated?.project_id) {
    revalidatePath(`/projects/${updated.project_id}`)
  }

  return { success: true }
}

export async function updateTaskAction(taskId: string, rawData: Partial<TaskFormValues>) {
  try {
    const supabase = await createClient()
    await supabase
      .from("project_tasks")
      .update({
        ...rawData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
  } catch (err) {
    console.error("Database error updating task:", err)
  }

  DEMO_TASKS = DEMO_TASKS.map((t) =>
    t.id === taskId ? { ...t, ...rawData, updated_at: new Date().toISOString() } : t
  )

  revalidatePath("/projects/tasks")
  return { success: true }
}

export async function deleteTaskAction(taskId: string) {
  try {
    const supabase = await createClient()
    await supabase.from("project_tasks").delete().eq("id", taskId)
  } catch {
    // fallback
  }

  const existing = DEMO_TASKS.find((t) => t.id === taskId)
  DEMO_TASKS = DEMO_TASKS.filter((t) => t.id !== taskId)

  revalidatePath("/projects/tasks")
  if (existing?.project_id) {
    revalidatePath(`/projects/${existing.project_id}`)
  }
  return { success: true }
}

export async function createMilestoneAction(rawData: MilestoneFormValues) {
  const validated = milestoneFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid milestone details",
    }
  }

  const { project_id, title, description, target_date, is_completed } = validated.data

  try {
    const supabase = await createClient()
    const { data: newMilestone, error } = await supabase
      .from("project_milestones")
      .insert({
        project_id,
        title,
        description: description || null,
        target_date,
        is_completed,
        order_index: DEMO_MILESTONES.length + 1,
      })
      .select()
      .single()

    if (!error && newMilestone) {
      revalidatePath(`/projects/${project_id}`)
      revalidatePath("/projects/tasks")
      return { success: true, milestoneId: newMilestone.id }
    }
  } catch (err) {
    console.error("Database error creating milestone, saving locally:", err)
  }

  const localMls: ProjectMilestone = {
    id: `mls-${Date.now()}`,
    project_id,
    title,
    description: description || null,
    target_date,
    completion_date: is_completed ? new Date().toISOString().split("T")[0] : null,
    order_index: DEMO_MILESTONES.length + 1,
    is_completed,
    tasks_count: 0,
    completed_tasks_count: 0,
    created_at: new Date().toISOString(),
  }

  DEMO_MILESTONES = [...DEMO_MILESTONES, localMls]
  revalidatePath(`/projects/${project_id}`)
  revalidatePath("/projects/tasks")

  return { success: true, milestoneId: localMls.id }
}

export async function toggleMilestoneAction(milestoneId: string, isCompleted: boolean) {
  try {
    const supabase = await createClient()
    await supabase
      .from("project_milestones")
      .update({
        is_completed: isCompleted,
        completion_date: isCompleted ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", milestoneId)
  } catch (err) {
    console.error("Database error updating milestone:", err)
  }

  DEMO_MILESTONES = DEMO_MILESTONES.map((m) =>
    m.id === milestoneId
      ? {
          ...m,
          is_completed: isCompleted,
          completion_date: isCompleted ? new Date().toISOString().split("T")[0] : null,
        }
      : m
  )

  const updated = DEMO_MILESTONES.find((m) => m.id === milestoneId)
  if (updated?.project_id) {
    revalidatePath(`/projects/${updated.project_id}`)
  }
  revalidatePath("/projects/tasks")
  return { success: true }
}

export async function getTaskStatSummaryAction(projectId?: string): Promise<{
  success: boolean
  summary: TaskStatSummary
}> {
  const { tasks } = await getTasksAction(projectId ? { projectId } : undefined)
  const total = tasks.length
  const backlog = tasks.filter((t) => t.status === "backlog").length
  const todo = tasks.filter((t) => t.status === "todo").length
  const in_progress = tasks.filter((t) => t.status === "in_progress").length
  const in_review = tasks.filter((t) => t.status === "in_review").length
  const done = tasks.filter((t) => t.status === "done").length

  const today = new Date().toISOString().split("T")[0]
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== "done"
  ).length

  const completion_rate = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    success: true,
    summary: {
      total_tasks: total,
      backlog_count: backlog,
      todo_count: todo,
      in_progress_count: in_progress,
      in_review_count: in_review,
      done_count: done,
      overdue_count: overdue,
      completion_rate,
    },
  }
}

export async function getActivityLogsAction(limit: number = 10): Promise<{
  success: boolean
  logs: ActivityLog[]
}> {
  return {
    success: true,
    logs: DEMO_ACTIVITY_LOGS.slice(0, limit),
  }
}
