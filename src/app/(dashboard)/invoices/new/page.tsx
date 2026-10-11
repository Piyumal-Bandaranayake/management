import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getClientsAction } from "@/actions/clients.actions"
import { getProjectsAction } from "@/actions/projects.actions"
import { InvoiceBuilder } from "@/components/invoices/invoice-builder"

export const metadata = {
  title: "Create Invoice | AgencyFlow",
  description: "Draft a new agency invoice with line items, tax rates, and client linkage.",
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; projectId?: string }>
}) {
  const { clientId, projectId } = await searchParams

  const [clientsRes, projectsRes] = await Promise.all([
    getClientsAction(),
    getProjectsAction(),
  ])

  const clients = clientsRes.success ? clientsRes.clients || [] : []
  const projects = projectsRes.success ? projectsRes.projects || [] : []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Create Agency Invoice</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft a client invoice with custom line items, VAT calculations, and milestone deliverables
            </p>
          </div>
        </div>
      </div>

      <InvoiceBuilder
        clients={clients}
        projects={projects}
        initialClientId={clientId}
        initialProjectId={projectId}
      />
    </div>
  )
}
