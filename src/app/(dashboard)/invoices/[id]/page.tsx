import { notFound } from "next/navigation"
import { getInvoiceByIdAction } from "@/actions/invoices.actions"
import { InvoiceDetailClient } from "./invoice-detail-client"

export const metadata = {
  title: "Invoice Details | AgencyFlow",
  description: "View agency invoice details, line items, and payment allocations.",
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInvoiceByIdAction(id)

  if (!result.success || !result.invoice) {
    notFound()
  }

  return <InvoiceDetailClient invoice={result.invoice} />
}
