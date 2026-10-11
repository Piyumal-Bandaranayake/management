import * as React from "react"
import { getClientsAction } from "@/actions/clients.actions"
import { ClientStatHeader } from "@/components/clients/client-stat-header"
import { ClientTableClientWrapper } from "@/components/clients/client-table-wrapper"

export const metadata = {
  title: "Clients — AgencyFlow",
  description: "Manage agency client accounts, contact profiles, and associated projects",
}

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const { clients = [] } = await getClientsAction()

  return (
    <div className="space-y-8">
      {/* Client Table + Dialog Wrapper */}
      <ClientTableClientWrapper initialClients={clients} />
    </div>
  )
}
