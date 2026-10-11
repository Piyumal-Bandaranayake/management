export type ProjectStatus =
  | 'lead'
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'on_hold'
  | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'freelancer'

export type AssignmentPaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface ProjectAssignment {
  id: string
  project_id: string
  team_member_id: string
  team_member_name?: string
  team_member_designation?: string
  team_member_email?: string
  role_in_project: string
  agreed_fee: number
  currency: string
  payment_status: AssignmentPaymentStatus
  notes?: string | null
  created_at: string
}

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
  notes?: string | null
}

export interface Project {
  id: string
  project_code: string
  client_id: string
  client_name?: string
  client_code?: string
  name: string
  description?: string | null
  category?: string | null
  technologies?: string[]
  status: ProjectStatus
  priority: ProjectPriority
  start_date?: string | null
  expected_delivery_date?: string | null
  actual_completion_date?: string | null
  currency: string
  contract_amount: number
  estimated_costs: number
  project_manager_id?: string | null
  project_manager_name?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Aggregated calculations
  assignments?: ProjectAssignment[]
  total_agreed_fees?: number
  estimated_profit?: number
  margin_percentage?: number
}

export interface ProjectFilterOptions {
  searchQuery?: string
  status?: ProjectStatus | 'all'
  clientId?: string
  priority?: ProjectPriority | 'all'
}
