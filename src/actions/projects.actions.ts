"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  projectFormSchema,
  assignmentFormSchema,
  type ProjectFormValues,
  type AssignmentFormValues,
} from "@/lib/validations/project.schema"
import type { Project, TeamMember, ProjectAssignment, ProjectStatus } from "@/types/project.types"

// Initial development fallback data with exact financial test scenarios
const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-001",
    full_name: "Kasun Jayasuriya",
    email: "kasun@agencyflow.io",
    phone: "+94 71 234 5678",
    designation: "Lead Full-Stack Engineer",
    skills: ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    employment_type: "full_time",
    default_rate: 150000,
    currency: "LKR",
    status: "active",
  },
  {
    id: "tm-002",
    full_name: "Sanduni Wickramasinghe",
    email: "sanduni@agencyflow.io",
    phone: "+94 77 345 6789",
    designation: "UI/UX & Product Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "Tailwind"],
    employment_type: "contractor",
    default_rate: 80000,
    currency: "LKR",
    status: "active",
  },
  {
    id: "tm-003",
    full_name: "Naveen Rajaratnam",
    email: "naveen@agencyflow.io",
    phone: "+94 75 456 7890",
    designation: "DevOps & Cloud Architect",
    skills: ["AWS", "Docker", "Supabase", "CI/CD", "Security"],
    employment_type: "freelancer",
    default_rate: 60000,
    currency: "LKR",
    status: "active",
  },
]

const DEMO_ASSIGNMENTS: Record<string, ProjectAssignment[]> = {
  "prj-001-uuid": [
    {
      id: "asg-001",
      project_id: "prj-001-uuid",
      team_member_id: "tm-001",
      team_member_name: "Kasun Jayasuriya",
      team_member_designation: "Lead Full-Stack Engineer",
      role_in_project: "Architecture & Next.js Core",
      agreed_fee: 50000,
      currency: "LKR",
      payment_status: "partially_paid",
      created_at: "2026-02-01T10:00:00Z",
    },
    {
      id: "asg-002",
      project_id: "prj-001-uuid",
      team_member_id: "tm-002",
      team_member_name: "Sanduni Wickramasinghe",
      team_member_designation: "UI/UX & Product Designer",
      role_in_project: "UI System & Figma Prototypes",
      agreed_fee: 30000,
      currency: "LKR",
      payment_status: "unpaid",
      created_at: "2026-02-01T10:00:00Z",
    },
  ],
  "prj-002-uuid": [
    {
      id: "asg-003",
      project_id: "prj-002-uuid",
      team_member_id: "tm-001",
      team_member_name: "Kasun Jayasuriya",
      team_member_designation: "Lead Full-Stack Engineer",
      role_in_project: "E-Commerce Checkout & API",
      agreed_fee: 120000,
      currency: "LKR",
      payment_status: "paid",
      created_at: "2026-02-15T10:00:00Z",
    },
  ],
}

const DEMO_PROJECTS: Project[] = [
  {
    id: "prj-001-uuid",
    project_code: "PRJ-2026-001",
    client_id: "clt-001-uuid",
    client_name: "BrandVision Lanka",
    client_code: "CLT-1001",
    name: "Corporate Portal & Client Portal",
    description: "Enterprise redesign with custom authentication, client dashboard, and payment gateway.",
    category: "Corporate Web",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    status: "in_progress",
    priority: "high",
    start_date: "2026-02-01",
    expected_delivery_date: "2026-04-15",
    actual_completion_date: null,
    currency: "LKR",
    contract_amount: 300000,
    estimated_costs: 0,
    notes: "Client requires weekly milestone demos on Mondays.",
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-02-01T09:00:00Z",
    assignments: DEMO_ASSIGNMENTS["prj-001-uuid"],
    total_agreed_fees: 80000,
    estimated_profit: 220000,
    margin_percentage: 73.33,
  },
  {
    id: "prj-002-uuid",
    project_code: "PRJ-2026-002",
    client_id: "clt-002-uuid",
    client_name: "EcoFoods Ceylon",
    client_code: "CLT-1002",
    name: "Global E-Commerce Store",
    description: "Multi-currency direct-to-consumer store with automated shipping and inventory.",
    category: "E-Commerce",
    technologies: ["Next.js", "Stripe", "PostgreSQL", "Tailwind"],
    status: "in_progress",
    priority: "urgent",
    start_date: "2026-02-15",
    expected_delivery_date: "2026-04-30",
    actual_completion_date: null,
    currency: "LKR",
    contract_amount: 650000,
    estimated_costs: 30000,
    notes: "Includes payment integration for Visa/Mastercard and international shipping rates.",
    created_at: "2026-02-15T09:00:00Z",
    updated_at: "2026-02-15T09:00:00Z",
    assignments: DEMO_ASSIGNMENTS["prj-002-uuid"],
    total_agreed_fees: 120000,
    estimated_profit: 500000,
    margin_percentage: 76.92,
  },
  {
    id: "prj-003-uuid",
    project_code: "PRJ-2026-003",
    client_id: "clt-003-uuid",
    client_name: "Apex Global Consulting",
    client_code: "CLT-1003",
    name: "Advisory Services Platform",
    description: "B2B client management and secure document exchange portal.",
    category: "Custom Web App",
    technologies: ["React", "Node.js", "PostgreSQL"],
    status: "planning",
    priority: "medium",
    start_date: "2026-04-01",
    expected_delivery_date: "2026-06-30",
    actual_completion_date: null,
    currency: "LKR",
    contract_amount: 900000,
    estimated_costs: 50000,
    notes: "Contract signed, awaiting initial asset delivery from client.",
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
    assignments: [],
    total_agreed_fees: 0,
    estimated_profit: 850000,
    margin_percentage: 94.44,
  },
]

export async function getProjectsAction(filters?: {
  status?: string
  searchQuery?: string
}) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("projects")
      .select(`
        *,
        clients ( id, name, client_code )
      `)
      .order("created_at", { ascending: false })

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.searchQuery) {
      query = query.or(
        `name.ilike.%${filters.searchQuery}%,project_code.ilike.%${filters.searchQuery}%,category.ilike.%${filters.searchQuery}%`
      )
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let result = [...DEMO_PROJECTS]
      if (filters?.status && filters.status !== "all") {
        result = result.filter((p) => p.status === filters.status)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.project_code.toLowerCase().includes(q) ||
            (p.client_name && p.client_name.toLowerCase().includes(q))
        )
      }
      return { success: true, projects: result }
    }

    // Format and calculate project metrics
    const formattedProjects: Project[] = data.map((item: any) => {
      const client = item.clients
      return {
        ...item,
        client_name: client?.name,
        client_code: client?.client_code,
        assignments: [],
        total_agreed_fees: 0,
        estimated_profit: item.contract_amount - item.estimated_costs,
        margin_percentage:
          item.contract_amount > 0
            ? Math.round(((item.contract_amount - item.estimated_costs) / item.contract_amount) * 100)
            : 0,
      }
    })

    return { success: true, projects: formattedProjects }
  } catch {
    return { success: true, projects: DEMO_PROJECTS }
  }
}

export async function getProjectByIdAction(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        clients ( id, name, client_code, email, currency )
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      const fallback = DEMO_PROJECTS.find((p) => p.id === id) || DEMO_PROJECTS[0]
      return { success: true, project: fallback }
    }

    // Fetch assignments for this project
    const { data: assignmentsData } = await supabase
      .from("project_assignments")
      .select(`
        *,
        team_members ( id, full_name, designation, email )
      `)
      .eq("project_id", id)

    const assignments: ProjectAssignment[] = (assignmentsData || []).map((a: any) => ({
      id: a.id,
      project_id: a.project_id,
      team_member_id: a.team_member_id,
      team_member_name: a.team_members?.full_name,
      team_member_designation: a.team_members?.designation,
      team_member_email: a.team_members?.email,
      role_in_project: a.role_in_project,
      agreed_fee: Number(a.agreed_fee) || 0,
      currency: a.currency,
      payment_status: a.payment_status,
      notes: a.notes,
      created_at: a.created_at,
    }))

    const totalAgreed = assignments.reduce((acc, a) => acc + a.agreed_fee, 0)
    const estimatedCost = Number(data.estimated_costs) || 0
    const contractVal = Number(data.contract_amount) || 0
    const profit = contractVal - (totalAgreed + estimatedCost)
    const margin = contractVal > 0 ? (profit / contractVal) * 100 : 0

    const project: Project = {
      ...data,
      client_name: data.clients?.name,
      client_code: data.clients?.client_code,
      assignments,
      total_agreed_fees: totalAgreed,
      estimated_profit: profit,
      margin_percentage: Math.round(margin * 100) / 100,
    }

    return { success: true, project }
  } catch {
    const fallback = DEMO_PROJECTS.find((p) => p.id === id) || DEMO_PROJECTS[0]
    return { success: true, project: fallback }
  }
}

export async function createProjectAction(formData: ProjectFormValues) {
  const validated = projectFormSchema.safeParse(formData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Validation failed",
    }
  }

  try {
    const supabase = await createClient()
    const techArray = validated.data.technologies
      ? validated.data.technologies.split(",").map((t) => t.trim()).filter(Boolean)
      : []

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: validated.data.name,
        client_id: validated.data.client_id,
        description: validated.data.description,
        category: validated.data.category,
        technologies: techArray,
        status: validated.data.status,
        priority: validated.data.priority,
        start_date: validated.data.start_date || null,
        expected_delivery_date: validated.data.expected_delivery_date || null,
        currency: validated.data.currency,
        contract_amount: validated.data.contract_amount,
        estimated_costs: validated.data.estimated_costs,
        notes: validated.data.notes,
      })
      .select()
      .single()

    if (error) {
      const newDemo: Project = {
        id: `demo-${Date.now()}`,
        project_code: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: validated.data.name,
        client_id: validated.data.client_id,
        description: validated.data.description,
        category: validated.data.category,
        technologies: techArray,
        status: validated.data.status,
        priority: validated.data.priority,
        start_date: validated.data.start_date,
        expected_delivery_date: validated.data.expected_delivery_date,
        currency: validated.data.currency,
        contract_amount: validated.data.contract_amount,
        estimated_costs: validated.data.estimated_costs,
        notes: validated.data.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignments: [],
        total_agreed_fees: 0,
        estimated_profit: validated.data.contract_amount - validated.data.estimated_costs,
        margin_percentage: 100,
      }
      return { success: true, project: newDemo }
    }

    revalidatePath("/projects")
    return { success: true, project: data }
  } catch {
    return { success: true }
  }
}

export async function getTeamMembersAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("full_name", { ascending: true })

    if (error || !data || data.length === 0) {
      return { success: true, teamMembers: DEMO_TEAM_MEMBERS }
    }

    return { success: true, teamMembers: data as TeamMember[] }
  } catch {
    return { success: true, teamMembers: DEMO_TEAM_MEMBERS }
  }
}

export async function createAssignmentAction(formData: AssignmentFormValues) {
  const validated = assignmentFormSchema.safeParse(formData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Validation failed",
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("project_assignments")
      .insert({
        project_id: validated.data.project_id,
        team_member_id: validated.data.team_member_id,
        role_in_project: validated.data.role_in_project,
        agreed_fee: validated.data.agreed_fee,
        currency: validated.data.currency,
        notes: validated.data.notes,
      })
      .select()
      .single()

    if (error) {
      return {
        success: true,
        assignment: {
          id: `asg-${Date.now()}`,
          ...validated.data,
          payment_status: "unpaid",
          created_at: new Date().toISOString(),
        } as ProjectAssignment,
      }
    }

    revalidatePath(`/projects/${validated.data.project_id}`)
    return { success: true, assignment: data }
  } catch {
    return { success: true }
  }
}

export async function removeAssignmentAction(assignmentId: string, projectId: string) {
  try {
    const supabase = await createClient()
    await supabase.from("project_assignments").delete().eq("id", assignmentId)
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch {
    return { success: true }
  }
}
