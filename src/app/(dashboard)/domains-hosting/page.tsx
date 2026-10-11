import * as React from "react"
import { getDomainsAction, getHostingAction } from "@/actions/domains-hosting.actions"
import { getClientsAction } from "@/actions/clients.actions"
import { getProjectsAction } from "@/actions/projects.actions"
import { DomainsHostingWrapper } from "@/components/domains/domains-hosting-wrapper"

export const metadata = {
  title: "Domains & Hosting — AgencyFlow",
  description: "Track technical domains, registrars, hosting infrastructure, and server allocations",
}

export default async function DomainsHostingPage() {
  const [
    { domains = [] },
    { hosting = [] },
    { clients = [] },
    { projects = [] },
  ] = await Promise.all([
    getDomainsAction(),
    getHostingAction(),
    getClientsAction(),
    getProjectsAction(),
  ])

  return (
    <div className="space-y-8">
      <DomainsHostingWrapper
        initialDomains={domains}
        initialHosting={hosting}
        clients={clients}
        projects={projects}
      />
    </div>
  )
}
