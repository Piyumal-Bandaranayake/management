import { getInvoicesAction } from "@/actions/invoices.actions"
import { InvoiceTableWrapper } from "@/components/invoices/invoice-table-wrapper"

export const metadata = {
  title: "Invoices | AgencyFlow",
  description: "Manage client billing, automated invoicing, tax rates, and receivables.",
}

export default async function InvoicesPage() {
  const result = await getInvoicesAction()
  const invoices = result.success ? result.invoices || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Receivables</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue client invoices, calculate VAT/taxes, track outstanding balances, and record payments
          </p>
        </div>
      </div>

      <InvoiceTableWrapper initialInvoices={invoices} />
    </div>
  )
}
