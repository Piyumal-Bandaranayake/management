"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Globe, Server, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DomainTable } from "@/components/domains/domain-table"
import { DomainDialog } from "@/components/domains/domain-dialog"
import { HostingTable } from "@/components/hosting/hosting-table"
import { HostingDialog } from "@/components/hosting/hosting-dialog"
import type { Domain, HostingService } from "@/types/domain-hosting.types"
import type { Client } from "@/types/client.types"
import type { Project } from "@/types/project.types"

interface DomainsHostingWrapperProps {
  initialDomains: Domain[]
  initialHosting: HostingService[]
  clients: Client[]
  projects: Project[]
}

export function DomainsHostingWrapper({
  initialDomains,
  initialHosting,
  clients,
  projects,
}: DomainsHostingWrapperProps) {
  const [domains, setDomains] = React.useState<Domain[]>(initialDomains)
  const [hosting, setHosting] = React.useState<HostingService[]>(initialHosting)

  const [domainDialogOpen, setDomainDialogOpen] = React.useState(false)
  const [hostingDialogOpen, setHostingDialogOpen] = React.useState(false)

  const handleDomainAdded = (newDomain: Domain) => {
    setDomains((prev) => [newDomain, ...prev])
  }

  const handleHostingAdded = (newHosting: HostingService) => {
    setHosting((prev) => [newHosting, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Domain & Hosting Infrastructure
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage web agency technical assets, DNS configurations, server nodes, and billing ownership.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/renewals">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Renewal Command Center</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setDomainDialogOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Domain</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setHostingDialogOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Hosting</span>
          </Button>
        </div>
      </div>

      {/* Tabs for Domains vs Hosting */}
      <Tabs defaultValue="domains" className="space-y-6">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="domains" className="text-xs sm:text-sm gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>Domains Portfolio ({domains.length})</span>
          </TabsTrigger>
          <TabsTrigger value="hosting" className="text-xs sm:text-sm gap-1.5">
            <Server className="h-3.5 w-3.5" />
            <span>Hosting Infrastructure ({hosting.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domains">
          <DomainTable domains={domains} />
        </TabsContent>

        <TabsContent value="hosting">
          <HostingTable hosting={hosting} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DomainDialog
        open={domainDialogOpen}
        onOpenChange={setDomainDialogOpen}
        clients={clients}
        projects={projects}
        onSuccess={handleDomainAdded}
      />

      <HostingDialog
        open={hostingDialogOpen}
        onOpenChange={setHostingDialogOpen}
        clients={clients}
        projects={projects}
        onSuccess={handleHostingAdded}
      />
    </div>
  )
}
