import { notFound } from "next/navigation"
import { getInvoiceByIdAction } from "@/actions/invoices.actions"
import { InvoicePrintableView } from "@/components/invoices/invoice-printable-view"

export const metadata = {
  title: "Print Invoice | AgencyFlow",
  description: "Printable vector PDF invoice layout with agency branding.",
}

export default async function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInvoiceByIdAction(id)

  if (!result.success || !result.invoice) {
    notFound()
  }

  return (
    <div className="py-2">
      <InvoicePrintableView invoice={result.invoice} />
    </div>
  )
}
