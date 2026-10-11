import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Edit, Mail, Building, Phone, MapPin } from "lucide-react"
import { getClientByIdAction } from "@/actions/clients.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClientDetailTabs } from "@/components/clients/client-detail-tabs"
import { formatCurrency } from "@/lib/utils"
import type { ClientStatus } from "@/types/client.types"

export const dynamic = "force-dynamic"

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const { client } = await getClientByIdAction(id)

  if (!client) {
    notFound()
  }

  const initials = client.name.substring(0, 2).toUpperCase()

  const statusMap: Record<ClientStatus, { label: string; variant: "success" | "warning" | "neutral" | "destructive" }> = {
    active: { label: "Active Client", variant: "success" },
    lead: { label: "Prospect Lead", variant: "warning" },
    inactive: { label: "Inactive", variant: "neutral" },
    archived: { label: "Archived", variant: "destructive" },
  }
  const statusConfig = statusMap[client.status] || { label: client.status, variant: "neutral" }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Client Directory</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-2xl border bg-primary/10 ring-2 ring-primary/20">
              <AvatarFallback className="text-lg font-black text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {client.name}
                </h1>
                <Badge variant={statusConfig.variant} className="text-xs font-bold">
                  {statusConfig.label}
                </Badge>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {client.client_code}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {client.company_name && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {client.company_name}
                  </span>
                )}
                {client.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {client.city}, {client.country}
                  </span>
                )}
                <span className="font-mono font-semibold text-foreground">
                  Billing Currency: {client.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href={`mailto:${client.email}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                <span>Contact Email</span>
              </Button>
            </Link>
            <Link href={`/clients`}>
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                <span>Manage Client</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Financial Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t">
          <div className="p-3 rounded-lg bg-muted/30">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Total Projects
            </span>
            <p className="text-lg font-black text-foreground mt-0.5">
              {client.project_count || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Active Deliverables
            </span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {client.active_project_count || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Lifetime Billed
            </span>
            <p className="text-lg font-black text-foreground mt-0.5">
              {formatCurrency(client.lifetime_invoiced || 0, client.currency)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
              Outstanding Balance
            </span>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {formatCurrency(client.outstanding_balance || 0, client.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <ClientDetailTabs client={client} />
    </div>
  )
}
