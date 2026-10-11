import type { PaymentMethod } from "./invoice.types"

export type ExpenseType = "operational" | "project"

export type ExpenseCategory =
  | "software_subscription"
  | "cloud_hosting"
  | "office_rent"
  | "marketing_ads"
  | "equipment_hardware"
  | "project_assets"
  | "subcontractor_fee"
  | "utilities_internet"
  | "legal_accounting"
  | "travel_meals"
  | "other"

export interface Expense {
  id: string
  expense_code: string
  title: string
  expense_type: ExpenseType
  category: ExpenseCategory
  amount: number
  currency: string
  exchange_rate_to_base: number
  base_amount: number
  expense_date: string
  payment_method: PaymentMethod
  vendor?: string | null
  reference_number?: string | null
  receipt_url?: string | null
  tax_deductible: boolean
  project_id?: string | null
  project_name?: string | null
  project_code?: string | null
  client_id?: string | null
  client_name?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialTransaction {
  id: string
  date: string
  type: "inflow" | "outflow"
  source: "client_payment" | "expense" | "team_payout"
  code: string
  title: string
  category: string
  party: string
  amount: number
  currency: string
  base_amount: number
  payment_method: PaymentMethod
  reference_number?: string | null
}

export interface CashFlowSummary {
  total_invoiced: number // Accrual basis
  total_cash_inflow: number // Realized cash collected
  total_operational_expenses: number
  total_project_expenses: number
  total_cash_outflow: number
  net_cash_profit: number // Realized Inflow - Realized Outflow
  net_cash_margin_percent: number
  outstanding_receivables: number
}

export interface ExpenseFilterOptions {
  searchQuery?: string
  expenseType?: ExpenseType | "all"
  category?: ExpenseCategory | "all"
  projectId?: string
  clientId?: string
}

export interface LedgerFilterOptions {
  searchQuery?: string
  type?: "all" | "inflow" | "outflow"
  source?: "all" | "client_payment" | "expense" | "team_payout"
  startDate?: string
  endDate?: string
}
