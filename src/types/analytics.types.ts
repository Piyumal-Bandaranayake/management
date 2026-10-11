export interface ExecutiveDashboardKPIs {
  total_clients: number
  active_projects: number
  contracted_pipeline: number // Total contract value of ongoing projects
  total_invoiced: number // Accrual basis
  total_cash_inflow: number // Realized cash collected
  outstanding_receivables: number
  total_cash_outflow: number // Expenses + Team Payouts
  net_cash_profit: number // Inflow - Outflow
  net_profit_margin: number // Net Profit %
  active_team_count: number
  pending_renewals_count: number
}

export interface MonthlyFinancialPoint {
  month: string
  inflow: number
  outflow: number
  profit: number
  invoiced: number
}

export interface ProjectMarginReport {
  id: string
  project_code: string
  project_name: string
  client_name: string
  status: string
  currency: string
  contract_amount: number
  team_costs: number
  direct_expenses: number
  total_costs: number
  net_profit: number
  margin_percentage: number
}

export interface ServiceCategoryRevenue {
  category: string
  revenue: number
  percentage: number
}

export interface ProjectStatusDistribution {
  status: string
  label: string
  count: number
  color: string
}

export interface ProfitLossStatement {
  period: string
  gross_inflow: number
  gross_invoiced: number
  contractor_costs: number
  gross_profit: number
  gross_margin_percentage: number
  operational_expenses: number
  project_expenses: number
  total_expenses: number
  net_operating_profit: number
  net_margin_percentage: number
  expense_breakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
}
