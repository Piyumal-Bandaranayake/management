"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  teamMemberFormSchema,
  teamPayoutFormSchema,
  type TeamMemberFormValues,
  type TeamPayoutFormValues,
} from "@/lib/validations/team.schema"
import type {
  TeamMember,
  TeamPayment,
  TeamStatSummary,
  TeamMemberFilterOptions,
  TeamPaymentFilterOptions,
} from "@/types/team.types"
import type { ProjectAssignment } from "@/types/project.types"

let DEMO_TEAM_MEMBERS: TeamMember[] = [
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
    bank_account_details: "Commercial Bank PLC - 1000 8829 4410 (Colombo Fort)",
    notes: "Core full-stack developer managing frontend architecture and APIs.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    active_assignments_count: 1,
    total_agreed_fees: 50000,
    total_paid: 50000,
    pending_payout: 0,
  },
  {
    id: "tm-002",
    full_name: "Sanduni Wickramasinghe",
    email: "sanduni@agencyflow.io",
    phone: "+94 77 345 6789",
    designation: "UI/UX & Product Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "Design Tokens"],
    employment_type: "contractor",
    default_rate: 80000,
    currency: "LKR",
    status: "active",
    bank_account_details: "Hatton National Bank - 0920 1192 8821 (Kollupitiya)",
    notes: "Senior UI/UX freelancer contracted for high-end web portals.",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    active_assignments_count: 1,
    total_agreed_fees: 30000,
    total_paid: 15000,
    pending_payout: 15000,
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
    bank_account_details: "Sampath Bank PLC - 0102 3391 0029 (Bambalapitiya)",
    notes: "Part-time cloud engineer handling server setup and SSL automation.",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    active_assignments_count: 1,
    total_agreed_fees: 60000,
    total_paid: 0,
    pending_payout: 60000,
  },
]

let DEMO_TEAM_PAYMENTS: TeamPayment[] = [
  {
    id: "pay-tm-001",
    payment_code: "TP-2026-0001",
    team_member_id: "tm-001",
    team_member_name: "Kasun Jayasuriya",
    team_member_designation: "Lead Full-Stack Engineer",
    project_assignment_id: "asg-001",
    project_id: "prj-001-uuid",
    project_name: "Corporate Rebrand & Portal",
    project_code: "PRJ-APX-01",
    amount: 50000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 50000,
    payment_date: "2026-03-09",
    payment_method: "bank_transfer",
    reference_number: "COMM-PAY-7712",
    receipt_url: null,
    notes: "100% full settlement for Corporate Rebrand full-stack milestones.",
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "pay-tm-002",
    payment_code: "TP-2026-0002",
    team_member_id: "tm-002",
    team_member_name: "Sanduni Wickramasinghe",
    team_member_designation: "UI/UX & Product Designer",
    project_assignment_id: "asg-002",
    project_id: "prj-001-uuid",
    project_name: "Corporate Rebrand & Portal",
    project_code: "PRJ-APX-01",
    amount: 15000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 15000,
    payment_date: "2026-03-09",
    payment_method: "bank_transfer",
    reference_number: "HNB-PAY-4419",
    receipt_url: null,
    notes: "50% design delivery milestone disbursement.",
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
]

export async function getTeamMembersAction(filters?: TeamMemberFilterOptions) {
  try {
    const supabase = await createClient()
    let query = supabase.from("team_members").select("*").order("created_at", { ascending: false })

    if (filters?.employmentType && filters.employmentType !== "all") {
      query = query.eq("employment_type", filters.employmentType)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_TEAM_MEMBERS]
      if (filters?.employmentType && filters.employmentType !== "all") {
        filtered = filtered.filter((m) => m.employment_type === filters.employmentType)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (m) =>
            m.full_name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.designation.toLowerCase().includes(q)
        )
      }
      return { success: true, teamMembers: filtered }
    }

    return { success: true, teamMembers: data }
  } catch {
    return { success: true, teamMembers: DEMO_TEAM_MEMBERS }
  }
}

export async function getTeamMemberByIdAction(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select(`
        *,
        project_assignments (
          id, project_id, role_in_project, agreed_fee, currency, payment_status, created_at,
          projects ( id, name, project_code )
        ),
        team_payments (
          id, payment_code, amount, currency, base_amount, payment_date, payment_method, reference_number, created_at,
          projects ( id, name, project_code )
        )
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      const fallback = DEMO_TEAM_MEMBERS.find((m) => m.id === id) || DEMO_TEAM_MEMBERS[0]
      const memberPayments = DEMO_TEAM_PAYMENTS.filter((p) => p.team_member_id === fallback.id)
      return {
        success: true,
        teamMember: {
          ...fallback,
          payments: memberPayments,
        },
      }
    }

    const assignments = (data.project_assignments || []).map((asg: any) => ({
      ...asg,
      project_name: asg.projects?.name,
      project_code: asg.projects?.project_code,
    }))

    const payments = (data.team_payments || []).map((pay: any) => ({
      ...pay,
      project_name: pay.projects?.name,
      project_code: pay.projects?.project_code,
    }))

    const totalAgreed = assignments.reduce((sum: number, a: any) => sum + Number(a.agreed_fee), 0)
    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.base_amount || p.amount), 0)

    const teamMember: TeamMember = {
      ...data,
      assignments,
      payments,
      total_agreed_fees: totalAgreed,
      total_paid: totalPaid,
      pending_payout: Math.max(0, totalAgreed - totalPaid),
      active_assignments_count: assignments.length,
    }

    return { success: true, teamMember }
  } catch {
    const fallback = DEMO_TEAM_MEMBERS.find((m) => m.id === id) || DEMO_TEAM_MEMBERS[0]
    return {
      success: true,
      teamMember: {
        ...fallback,
        payments: DEMO_TEAM_PAYMENTS.filter((p) => p.team_member_id === fallback.id),
      },
    }
  }
}

export async function createTeamMemberAction(rawData: TeamMemberFormValues) {
  const validated = teamMemberFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid member details",
    }
  }

  const {
    full_name,
    email,
    phone,
    designation,
    employment_type,
    default_rate,
    currency,
    status,
    bank_account_details,
    skills,
    notes,
  } = validated.data

  const parsedSkills = skills
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  try {
    const supabase = await createClient()
    const { data: newMember, error } = await supabase
      .from("team_members")
      .insert({
        full_name,
        email,
        phone,
        designation,
        employment_type,
        default_rate,
        currency,
        status,
        bank_account_details,
        skills: parsedSkills,
        notes,
      })
      .select()
      .single()

    if (!error && newMember) {
      revalidatePath("/team")
      return { success: true, teamMemberId: newMember.id }
    }
  } catch (err) {
    console.error("Database error creating team member, saving locally:", err)
  }

  const newLocalMember: TeamMember = {
    id: `tm-${Date.now()}`,
    full_name,
    email,
    phone: phone || null,
    designation,
    employment_type,
    default_rate: Number(default_rate),
    currency,
    status,
    bank_account_details: bank_account_details || null,
    skills: parsedSkills,
    notes: notes || null,
    created_at: new Date().toISOString(),
    active_assignments_count: 0,
    total_agreed_fees: 0,
    total_paid: 0,
    pending_payout: 0,
  }

  DEMO_TEAM_MEMBERS = [newLocalMember, ...DEMO_TEAM_MEMBERS]
  revalidatePath("/team")
  return { success: true, teamMemberId: newLocalMember.id }
}

export async function getTeamPayoutsAction(filters?: TeamPaymentFilterOptions) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("team_payments")
      .select(`
        *,
        team_members ( id, full_name, designation ),
        projects ( id, name, project_code )
      `)
      .order("payment_date", { ascending: false })

    if (filters?.teamMemberId) {
      query = query.eq("team_member_id", filters.teamMemberId)
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "all") {
      query = query.eq("payment_method", filters.paymentMethod)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_TEAM_PAYMENTS]
      if (filters?.teamMemberId) {
        filtered = filtered.filter((p) => p.team_member_id === filters.teamMemberId)
      }
      if (filters?.paymentMethod && filters.paymentMethod !== "all") {
        filtered = filtered.filter((p) => p.payment_method === filters.paymentMethod)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.payment_code.toLowerCase().includes(q) ||
            p.team_member_name?.toLowerCase().includes(q) ||
            (p.reference_number && p.reference_number.toLowerCase().includes(q))
        )
      }
      return { success: true, payments: filtered }
    }

    const formatted: TeamPayment[] = data.map((item: any) => ({
      ...item,
      team_member_name: item.team_members?.full_name,
      team_member_designation: item.team_members?.designation,
      project_name: item.projects?.name,
      project_code: item.projects?.project_code,
    }))

    return { success: true, payments: formatted }
  } catch {
    return { success: true, payments: DEMO_TEAM_PAYMENTS }
  }
}

export async function recordTeamPayoutAction(rawData: TeamPayoutFormValues) {
  const validated = teamPayoutFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid payout details",
    }
  }

  const {
    team_member_id,
    project_assignment_id,
    project_id,
    amount,
    currency,
    exchange_rate_to_base,
    payment_date,
    payment_method,
    reference_number,
    notes,
  } = validated.data

  const base_amount = Number(amount) * Number(exchange_rate_to_base)
  const currentYear = new Date().getFullYear()
  const nextSeq = 1000 + DEMO_TEAM_PAYMENTS.length + 1
  const generatedCode = `TP-${currentYear}-${String(nextSeq).padStart(4, "0")}`

  try {
    const supabase = await createClient()

    // 1. Insert team payment record
    const { data: newPayment, error: payError } = await supabase
      .from("team_payments")
      .insert({
        payment_code: generatedCode,
        team_member_id,
        project_assignment_id: project_assignment_id || null,
        project_id: project_id || null,
        amount,
        currency,
        exchange_rate_to_base,
        base_amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
      })
      .select()
      .single()

    if (!payError && newPayment) {
      // 2. If tied to a project assignment, update assignment payment status
      if (project_assignment_id) {
        await supabase
          .from("project_assignments")
          .update({ payment_status: "paid" })
          .eq("id", project_assignment_id)
      }

      revalidatePath("/team")
      revalidatePath("/team/payments")
      revalidatePath(`/team/${team_member_id}`)
      revalidatePath("/finances")
      return { success: true, paymentId: newPayment.id }
    }
  } catch (err) {
    console.error("Database error recording team payout, applying locally:", err)
  }

  const member = DEMO_TEAM_MEMBERS.find((m) => m.id === team_member_id)

  const newLocalPayout: TeamPayment = {
    id: `pay-tm-${Date.now()}`,
    payment_code: generatedCode,
    team_member_id,
    team_member_name: member?.full_name || "Team Member",
    team_member_designation: member?.designation || "Engineer",
    project_assignment_id: project_assignment_id || null,
    project_id: project_id || null,
    project_name: project_id ? "Associated Project" : null,
    amount: Number(amount),
    currency,
    exchange_rate_to_base,
    base_amount,
    payment_date,
    payment_method,
    reference_number: reference_number || null,
    receipt_url: null,
    notes: notes || null,
    created_at: new Date().toISOString(),
  }

  DEMO_TEAM_PAYMENTS = [newLocalPayout, ...DEMO_TEAM_PAYMENTS]

  // Update member totals
  if (member) {
    member.total_paid = (member.total_paid || 0) + Number(amount)
    member.pending_payout = Math.max(0, (member.total_agreed_fees || 0) - member.total_paid)
  }

  revalidatePath("/team")
  revalidatePath("/team/payments")
  revalidatePath(`/team/${team_member_id}`)
  revalidatePath("/finances")

  return { success: true, paymentId: newLocalPayout.id }
}

export async function getTeamStatSummaryAction(): Promise<{
  success: boolean
  summary: TeamStatSummary
}> {
  try {
    const [membersRes, paymentsRes] = await Promise.all([
      getTeamMembersAction(),
      getTeamPayoutsAction(),
    ])

    const members = membersRes.teamMembers || []
    const payments = paymentsRes.payments || []

    const total_members = members.length
    const active_contractors = members.filter(
      (m) => m.employment_type === "contractor" || m.employment_type === "freelancer"
    ).length

    const total_disbursed = payments.reduce(
      (sum, p) => sum + Number(p.base_amount || p.amount),
      0
    )

    const pending_commitments = members.reduce(
      (sum, m) => sum + Number(m.pending_payout || 0),
      0
    )

    return {
      success: true,
      summary: {
        total_members,
        active_contractors,
        total_disbursed,
        pending_commitments,
      },
    }
  } catch {
    return {
      success: true,
      summary: {
        total_members: 3,
        active_contractors: 2,
        total_disbursed: 65000,
        pending_commitments: 75000,
      },
    }
  }
}
