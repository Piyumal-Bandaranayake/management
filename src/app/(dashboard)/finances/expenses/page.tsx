import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Receipt } from "lucide-react"
import { getExpensesAction } from "@/actions/finances.actions"
import { getProjectsAction } from "@/actions/projects.actions"
import { ExpenseTableWrapper } from "@/components/finances/expense-table-wrapper"

export const metadata = {
  title: "Business Expenses | AgencyFlow",
  description: "Track operational overhead, SaaS subscriptions, and project-specific direct costs.",
}

export default async function ExpensesPage() {
  const [expRes, projRes] = await Promise.all([
    getExpensesAction(),
    getProjectsAction(),
  ])

  const expenses = expRes.success ? expRes.expenses || [] : []
  const projects = projRes.success ? projRes.projects || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/finances">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business Expenses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Record agency operational costs, SaaS tools, and direct project liabilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/finances">
              <Receipt className="h-3.5 w-3.5" />
              Cash Flow Overview
            </Link>
          </Button>
        </div>
      </div>

      <ExpenseTableWrapper initialExpenses={expenses} projects={projects} />
    </div>
  )
}
