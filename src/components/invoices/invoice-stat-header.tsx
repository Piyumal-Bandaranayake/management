"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { Invoice } from "@/types/invoice.types"

interface InvoiceStatHeaderProps {
  invoices: Invoice[]
}

export function InvoiceStatHeader({ invoices }: InvoiceStatHeaderProps) {
  const totalInvoiced = invoices
    .filter((i) => i.status !== "void")
    .reduce((sum, i) => sum + Number(i.total_amount), 0)

  const totalReceived = invoices
    .filter((i) => i.status !== "void")
    .reduce((sum, i) => sum + Number(i.amount_paid), 0)

  const totalOutstanding = invoices
    .filter((i) => i.status !== "void" && i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.balance_due), 0)

  const overdueInvoices = invoices.filter(
    (i) => i.status === "overdue" || (new Date(i.due_date) < new Date() && Number(i.balance_due) > 0)
  )
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + Number(i.balance_due), 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border/60 shadow-sm bg-card hover:border-primary/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Invoiced
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1">
              LKR {totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.length} active agency invoices
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-emerald-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cash Collected
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
              LKR {totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">
              Verified client cash inflows
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-amber-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Outstanding Balance
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
              LKR {totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Accounts receivable awaiting collection
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-rose-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Overdue Receivables
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-rose-600 dark:text-rose-400">
              LKR {overdueTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 font-medium">
              {overdueInvoices.length} invoices requiring follow-up
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
