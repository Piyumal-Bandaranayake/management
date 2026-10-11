import { getClientPaymentsAction } from "@/actions/invoices.actions"
import { PaymentsTableWrapper } from "@/components/invoices/payments-table-wrapper"

export const metadata = {
  title: "Client Payments | AgencyFlow",
  description: "Verified cash inflows, payment methods, and invoice allocations.",
}

export default async function ClientPaymentsPage() {
  const result = await getClientPaymentsAction()
  const payments = result.success ? result.payments || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Payments & Receipts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verified cash settlements, bank transfer slips, Wise transfers, and invoice allocations
          </p>
        </div>
      </div>

      <PaymentsTableWrapper initialPayments={payments} />
    </div>
  )
}
