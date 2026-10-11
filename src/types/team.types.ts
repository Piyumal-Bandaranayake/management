import type { PaymentMethod } from "./invoice.types"
import type {
  EmploymentType,
  AssignmentPaymentStatus,
  ProjectAssignment,
} from "./project.types"

export type { EmploymentType, AssignmentPaymentStatus }

export interface TeamMember {
  id: string
  profile_id?: string | null
  full_name: string
  email: string
  phone?: string | null
  designation: string
  skills?: string[]
  employment_type: EmploymentType
  default_rate?: number
  currency: string
  status: string
  bank_account_details?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
  // Aggregated financials
  active_assignments_count?: number
  total_agreed_fees?: number
  total_paid?: number
  pending_payout?: number
  assignments?: ProjectAssignment[]
  payments?: TeamPayment[]
}

export interface TeamPayment {
  id: string
  payment_code: string
  team_member_id: string
  team_member_name?: string
  team_member_designation?: string
  project_assignment_id?: string | null
  project_id?: string | null
  project_name?: string | null
  project_code?: string | null
  amount: number
  currency: string
  exchange_rate_to_base: number
  base_amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number?: string | null
  receipt_url?: string | null
  notes?: string | null
  created_at: string
}

export interface TeamStatSummary {
  total_members: number
  active_contractors: number
  total_disbursed: number
  pending_commitments: number
}

export interface TeamMemberFilterOptions {
  searchQuery?: string
  employmentType?: EmploymentType | "all"
  status?: string
}

export interface TeamPaymentFilterOptions {
  searchQuery?: string
  teamMemberId?: string
  projectId?: string
  paymentMethod?: PaymentMethod | "all"
}
