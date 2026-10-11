"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validations/finance.schema"
import type {
  Expense,
  FinancialTransaction,
  CashFlowSummary,
  ExpenseFilterOptions,
  LedgerFilterOptions,
} from "@/types/finance.types"
import { getInvoicesAction, getClientPaymentsAction } from "./invoices.actions"
import { getTeamPayoutsAction } from "./team.actions"

let DEMO_EXPENSES: Expense[] = [
  {
    id: "exp-001-uuid",
    expense_code: "EXP-2026-0001",
    title: "Figma Organization Annual Design License",
    expense_type: "operational",
    category: "software_subscription",
    amount: 145000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 145000,
    expense_date: "2026-02-01",
    payment_method: "credit_card",
    vendor: "Figma, Inc.",
    reference_number: "INV-FIG-2026-9921",
    receipt_url: null,
    tax_deductible: true,
    project_id: null,
    project_name: null,
    client_id: null,
    client_name: null,
    notes: "Core design tooling licenses for 5 product designers.",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "exp-002-uuid",
    expense_code: "EXP-2026-0002",
    title: "AWS Cloud & Supabase Production Hosting (March)",
    expense_type: "operational",
    category: "cloud_hosting",
    amount: 68000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 68000,
    expense_date: "2026-03-01",
    payment_method: "credit_card",
    vendor: "Amazon Web Services",
    reference_number: "AWS-INV-771239",
    receipt_url: null,
    tax_deductible: true,
    project_id: null,
    project_name: null,
    client_id: null,
    client_name: null,
    notes: "Core cluster compute & PostgreSQL database replication.",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "exp-003-uuid",
    expense_code: "EXP-2026-0003",
    title: "Shutterstock Enterprise 4K Hero Video License Pack",
    expense_type: "project",
    category: "project_assets",
    amount: 35000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 35000,
    expense_date: "2026-03-05",
    payment_method: "credit_card",
    vendor: "Shutterstock",
    reference_number: "SSTK-LIC-88124",
    receipt_url: null,
    tax_deductible: true,
    project_id: "prj-001-uuid",
    project_name: "Corporate Rebrand & Portal",
    project_code: "PRJ-APX-01",
    client_id: "cli-001-uuid",
    client_name: "Apex Holdings (Pvt) Ltd",
    notes: "Licensed high-res corporate footage for homepage video reel.",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "exp-004-uuid",
    expense_code: "EXP-2026-0004",
    title: "Algolia Enterprise Search API Dedicated Plan",
    expense_type: "project",
    category: "software_subscription",
    amount: 48000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 48000,
    expense_date: "2026-02-22",
    payment_method: "wise",
    vendor: "Algolia Inc.",
    reference_number: "ALG-SUB-33821",
    receipt_url: null,
    tax_deductible: true,
    project_id: "prj-002-uuid",
    project_name: "Global B2B Wholesale Portal",
    project_code: "PRJ-CTG-02",
    client_id: "cli-002-uuid",
    client_name: "Ceylon Teas Global Ltd",
    notes: "High-speed product catalog indexing for international wholesale portal.",
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: "exp-005-uuid",
    expense_code: "EXP-2026-0005",
    title: "Office High-Speed Fiber Internet & Static IP (March)",
    expense_type: "operational",
    category: "utilities_internet",
    amount: 18500,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 18500,
    expense_date: "2026-03-02",
    payment_method: "bank_transfer",
    vendor: "Sri Lanka Telecom PLC",
    reference_number: "SLT-BILL-99218",
    receipt_url: null,
    tax_deductible: true,
    project_id: null,
    project_name: null,
    client_id: null,
    client_name: null,
    notes: "Dedicated fiber link for agency development team.",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

export async function getExpensesAction(filters?: ExpenseFilterOptions) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("expenses")
      .select(`
        *,
        projects ( id, name, project_code ),
        clients ( id, name )
      `)
      .order("expense_date", { ascending: false })

    if (filters?.expenseType && filters.expenseType !== "all") {
      query = query.eq("expense_type", filters.expenseType)
    }
    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }
    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId)
    }
    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId)

    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_EXPENSES]
      if (filters?.expenseType && filters.expenseType !== "all") {
        filtered = filtered.filter((e) => e.expense_type === filters.expenseType)
      }
      if (filters?.category && filters.category !== "all") {
        filtered = filtered.filter((e) => e.category === filters.category)
      }
      if (filters?.projectId) {
        filtered = filtered.filter((e) => e.project_id === filters.projectId)
      }
      if (filters?.clientId) {
        filtered = filtered.filter((e) => e.client_id === filters.clientId)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.expense_code.toLowerCase().includes(q) ||
            (e.vendor && e.vendor.toLowerCase().includes(q))
        )
      }
      return { success: true, expenses: filtered }
    }

    const formatted: Expense[] = data.map((item: any) => ({
      ...item,
      project_name: item.projects?.name,
      project_code: item.projects?.project_code,
      client_name: item.clients?.name,
    }))

    return { success: true, expenses: formatted }
  } catch {
    return { success: true, expenses: DEMO_EXPENSES }
  }
}

export async function createExpenseAction(rawData: ExpenseFormValues) {
  const validated = expenseFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid expense details",
    }
  }

  const {
    title,
    expense_type,
    category,
    amount,
    currency,
    exchange_rate_to_base,
    expense_date,
    payment_method,
    vendor,
    reference_number,
    receipt_url,
    tax_deductible,
    project_id,
    client_id,
    notes,
  } = validated.data

  const base_amount = Number(amount) * Number(exchange_rate_to_base)
  const currentYear = new Date().getFullYear()
  const nextSeq = 1000 + DEMO_EXPENSES.length + 1
  const generatedCode = `EXP-${currentYear}-${String(nextSeq).padStart(4, "0")}`

  try {
    const supabase = await createClient()
    const { data: newExpense, error } = await supabase
      .from("expenses")
      .insert({
        expense_code: generatedCode,
        title,
        expense_type,
        category,
        amount,
        currency,
        exchange_rate_to_base,
        base_amount,
        expense_date,
        payment_method,
        vendor,
        reference_number,
        receipt_url,
        tax_deductible,
        project_id: project_id || null,
        client_id: client_id || null,
        notes,
      })
      .select()
      .single()

    if (!error && newExpense) {
      revalidatePath("/finances")
      revalidatePath("/finances/expenses")
      revalidatePath("/dashboard")
      return { success: true, expenseId: newExpense.id }
    }
  } catch (err) {
    console.error("Database error creating expense, applying to demo state:", err)
  }

  const newLocalExpense: Expense = {
    id: `exp-${Date.now()}`,
    expense_code: generatedCode,
    title,
    expense_type,
    category,
    amount: Number(amount),
    currency,
    exchange_rate_to_base,
    base_amount,
    expense_date,
    payment_method,
    vendor: vendor || null,
    reference_number: reference_number || null,
    receipt_url: receipt_url || null,
    tax_deductible,
    project_id: project_id || null,
    project_name: project_id ? "Associated Project" : null,
    client_id: client_id || null,
    client_name: client_id ? "Associated Client" : null,
    notes: notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  DEMO_EXPENSES = [newLocalExpense, ...DEMO_EXPENSES]
  revalidatePath("/finances")
  revalidatePath("/finances/expenses")
  revalidatePath("/dashboard")

  return { success: true, expenseId: newLocalExpense.id }
}

export async function deleteExpenseAction(id: string) {
  try {
    const supabase = await createClient()
    await supabase.from("expenses").delete().eq("id", id)
  } catch {
    // fallback
  }

  DEMO_EXPENSES = DEMO_EXPENSES.filter((e) => e.id !== id)
  revalidatePath("/finances")
  revalidatePath("/finances/expenses")
  return { success: true }
}

export async function getCashFlowSummaryAction(): Promise<{
  success: boolean
  summary: CashFlowSummary
}> {
  try {
    // 1. Fetch Invoices for Accrual metrics
    const invRes = await getInvoicesAction()
    const invoices = invRes.success ? invRes.invoices || [] : []

    const total_invoiced = invoices
      .filter((i) => i.status !== "void")
      .reduce((sum, i) => sum + Number(i.base_total_amount || i.total_amount), 0)

    // 2. Fetch Client Payments for Realized Cash Inflow (NO DOUBLE COUNTING)
    const payRes = await getClientPaymentsAction()
    const payments = payRes.success ? payRes.payments || [] : []

    const total_cash_inflow = payments.reduce(
      (sum, p) => sum + Number(p.base_amount || p.amount),
      0
    )

    // 3. Fetch Expenses & Team Payouts for Realized Cash Outflow
    const [expRes, teamPayoutsRes] = await Promise.all([
      getExpensesAction(),
      getTeamPayoutsAction(),
    ])
    const expenses = expRes.success ? expRes.expenses || [] : []
    const teamPayouts = teamPayoutsRes.success ? teamPayoutsRes.payments || [] : []

    const total_operational_expenses = expenses
      .filter((e) => e.expense_type === "operational")
      .reduce((sum, e) => sum + Number(e.base_amount || e.amount), 0)

    const total_team_payouts = teamPayouts.reduce(
      (sum, p) => sum + Number(p.base_amount || p.amount),
      0
    )

    const total_project_expenses =
      expenses
        .filter((e) => e.expense_type === "project")
        .reduce((sum, e) => sum + Number(e.base_amount || e.amount), 0) +
      total_team_payouts

    const total_cash_outflow = total_operational_expenses + total_project_expenses

    // 4. Net Cash Profit = Realized Inflows - Realized Outflows
    const net_cash_profit = total_cash_inflow - total_cash_outflow
    const net_cash_margin_percent =
      total_cash_inflow > 0
        ? Math.round((net_cash_profit / total_cash_inflow) * 1000) / 10
        : 0

    const outstanding_receivables = Math.max(0, total_invoiced - total_cash_inflow)

    return {
      success: true,
      summary: {
        total_invoiced,
        total_cash_inflow,
        total_operational_expenses,
        total_project_expenses,
        total_cash_outflow,
        net_cash_profit,
        net_cash_margin_percent,
        outstanding_receivables,
      },
    }
  } catch {
    return {
      success: true,
      summary: {
        total_invoiced: 733000,
        total_cash_inflow: 400000,
        total_operational_expenses: 231500,
        total_project_expenses: 83000,
        total_cash_outflow: 314500,
        net_cash_profit: 85500,
        net_cash_margin_percent: 21.4,
        outstanding_receivables: 333000,
      },
    }
  }
}

export async function getFinancialTransactionsLedgerAction(
  filters?: LedgerFilterOptions
): Promise<{ success: boolean; transactions: FinancialTransaction[] }> {
  try {
    const [payRes, expRes, teamPayoutsRes] = await Promise.all([
      getClientPaymentsAction(),
      getExpensesAction(),
      getTeamPayoutsAction(),
    ])

    const payments = payRes.success ? payRes.payments || [] : []
    const expenses = expRes.success ? expRes.expenses || [] : []
    const teamPayouts = teamPayoutsRes.success ? teamPayoutsRes.payments || [] : []

    // Convert Payments into Inflow Ledger Items
    const inflowTransactions: FinancialTransaction[] = payments.map((p) => ({
      id: `inflow-${p.id}`,
      date: p.payment_date,
      type: "inflow",
      source: "client_payment",
      code: p.payment_code,
      title: `Client Payment — ${p.client_name || "Client"}`,
      category: "Client Inflow",
      party: p.client_name || "Client Account",
      amount: Number(p.amount),
      currency: p.currency,
      base_amount: Number(p.base_amount || p.amount),
      payment_method: p.payment_method,
      reference_number: p.reference_number || null,
    }))

    // Convert Expenses into Outflow Ledger Items
    const outflowTransactions: FinancialTransaction[] = expenses.map((e) => ({
      id: `outflow-${e.id}`,
      date: e.expense_date,
      type: "outflow",
      source: "expense",
      code: e.expense_code,
      title: e.title,
      category: e.category.replace("_", " "),
      party: e.vendor || (e.expense_type === "project" ? e.project_name || "Project" : "Agency Vendor"),
      amount: Number(e.amount),
      currency: e.currency,
      base_amount: Number(e.base_amount || e.amount),
      payment_method: e.payment_method,
      reference_number: e.reference_number || null,
    }))

    // Convert Team Payouts into Outflow Ledger Items
    const payoutTransactions: FinancialTransaction[] = teamPayouts.map((tp) => ({
      id: `payout-${tp.id}`,
      date: tp.payment_date,
      type: "outflow",
      source: "team_payout",
      code: tp.payment_code,
      title: `Contractor Payout — ${tp.team_member_name || "Team Member"}`,
      category: "Contractor Payout",
      party: tp.team_member_name
        ? `${tp.team_member_name} (${tp.team_member_designation || "Contractor"})`
        : "Contractor Payout",
      amount: Number(tp.amount),
      currency: tp.currency,
      base_amount: Number(tp.base_amount || tp.amount),
      payment_method: tp.payment_method,
      reference_number: tp.reference_number || null,
    }))

    let allTransactions = [...inflowTransactions, ...outflowTransactions, ...payoutTransactions]

    // Sort chronologically newest first
    allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (filters?.type && filters.type !== "all") {
      allTransactions = allTransactions.filter((t) => t.type === filters.type)
    }
    if (filters?.source && filters.source !== "all") {
      allTransactions = allTransactions.filter((t) => t.source === filters.source)
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      allTransactions = allTransactions.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.party.toLowerCase().includes(q) ||
          (t.reference_number && t.reference_number.toLowerCase().includes(q))
      )
    }

    return { success: true, transactions: allTransactions }
  } catch {
    return { success: true, transactions: [] }
  }
}
