import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Receipt, ArrowRight } from "lucide-react"
import {
  getCashFlowSummaryAction,
  getFinancialTransactionsLedgerAction,
} from "@/actions/finances.actions"
import { FinancialStatCards } from "@/components/finances/financial-stat-cards"
import { CashFlowBreakdown } from "@/components/finances/cashflow-breakdown"
import { TransactionLedgerTable } from "@/components/finances/transaction-ledger-table"

export const metadata = {
  title: "Cash Flow & Finances | AgencyFlow",
  description: "Accurate cash accounting, realized inflows, outflows, and unified ledger.",
}

export default async function FinancesPage() {
  const [summaryRes, ledgerRes] = await Promise.all([
    getCashFlowSummaryAction(),
    getFinancialTransactionsLedgerAction(),
  ])

  const summary = summaryRes.summary
  const transactions = ledgerRes.transactions || []

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Flow & Financials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Realized cash accounting, double-count-free ledger, operational overhead, and net profitability
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/finances/expenses">
              <DollarSign className="h-3.5 w-3.5 text-rose-600" />
              Manage Expenses
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/invoices/payments">
              <Receipt className="h-3.5 w-3.5 text-emerald-600" />
              Client Payments
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top Financial Cards */}
      <FinancialStatCards summary={summary} />

      {/* 3. Realized Distribution & Anti-Double-Counting Breakdown */}
      <CashFlowBreakdown summary={summary} />

      {/* 4. Unified Chronological Transaction Ledger */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Financial Stream & Cash Ledger</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unified chronological timeline of every realized money inflow and outflow
            </p>
          </div>
        </div>

        <TransactionLedgerTable transactions={transactions} />
      </div>
    </div>
  )
}
