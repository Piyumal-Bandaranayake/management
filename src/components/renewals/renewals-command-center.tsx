"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Clock,
  Calendar,
  Globe,
  Server,
  DollarSign,
  CheckCircle2,
  Receipt,
  Building,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { RenewalItem } from "@/types/domain-hosting.types"

interface RenewalsCommandCenterProps {
  renewals: RenewalItem[]
  totalUpcomingCost: number
  agencyBilledCost: number
}

export function RenewalsCommandCenter({
  renewals,
  totalUpcomingCost,
  agencyBilledCost,
}: RenewalsCommandCenterProps) {
  const [filterType, setFilterType] = React.useState<"all" | "domain" | "hosting">("all")
  const [filterTier, setFilterTier] = React.useState<"all" | "7" | "14" | "30">("all")

  const criticalCount = renewals.filter((r) => r.days_until_expiration <= 7 && r.days_until_expiration >= 0).length
  const upcoming14Count = renewals.filter((r) => r.days_until_expiration > 7 && r.days_until_expiration <= 14).length
  const notice30Count = renewals.filter((r) => r.days_until_expiration > 14 && r.days_until_expiration <= 30).length

  const filteredRenewals = React.useMemo(() => {
    return renewals.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false
      if (filterTier === "7" && (item.days_until_expiration > 7 || item.days_until_expiration < 0)) return false
      if (filterTier === "14" && (item.days_until_expiration > 14 || item.days_until_expiration <= 7)) return false
      if (filterTier === "30" && (item.days_until_expiration > 30 || item.days_until_expiration <= 14)) return false
      return true
    })
  }, [renewals, filterType, filterTier])

  return (
    <div className="space-y-8">
      {/* Financial Liability KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Cost in 30 Days */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              30-Day Renewal Commitments
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">
              {formatCurrency(totalUpcomingCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined technical renewals due this month
            </p>
          </CardContent>
        </Card>

        {/* Billed to Client (Recoverable) */}
        <Card className="hover:shadow-sm transition-shadow border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Client Recoverable Value
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(agencyBilledCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To be invoiced to clients upon renewal
            </p>
          </CardContent>
        </Card>

        {/* Critical Alerts Count */}
        <Card className="hover:shadow-sm transition-shadow border-red-500/20 bg-red-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Urgent Attention Required
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
              {criticalCount} Critical
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expiring within the next 7 calendar days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiration Tier Tabs / Alert Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Tiers:</span>
          <Button
            variant={filterTier === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTier("all")}
            className="h-8 text-xs"
          >
            All Active ({renewals.length})
          </Button>
          <Button
            variant={filterTier === "7" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterTier("7")}
            className="h-8 text-xs gap-1.5"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>&lt; 7 Days ({criticalCount})</span>
          </Button>
          <Button
            variant={filterTier === "14" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTier("14")}
            className="h-8 text-xs gap-1.5"
          >
            <Clock className="h-3 w-3" />
            <span>&lt; 14 Days ({upcoming14Count})</span>
          </Button>
          <Button
            variant={filterTier === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTier("30")}
            className="h-8 text-xs"
          >
            <span>&lt; 30 Days ({notice30Count})</span>
          </Button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <Button
            variant={filterType === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="h-8 text-xs"
          >
            All Types
          </Button>
          <Button
            variant={filterType === "domain" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("domain")}
            className="h-8 text-xs gap-1"
          >
            <Globe className="h-3 w-3" />
            <span>Domains</span>
          </Button>
          <Button
            variant={filterType === "hosting" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("hosting")}
            className="h-8 text-xs gap-1"
          >
            <Server className="h-3 w-3" />
            <span>Hosting</span>
          </Button>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                <th className="p-3 px-4">Asset & Type</th>
                <th className="p-3">Client Account</th>
                <th className="p-3">Expiration Date</th>
                <th className="p-3">Renewal Cost</th>
                <th className="p-3">Payment Responsibility</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRenewals.length > 0 ? (
                filteredRenewals.map((item) => {
                  const daysLeft = item.days_until_expiration
                  const isCritical = daysLeft <= 7
                  const isUpcoming = daysLeft <= 14 && daysLeft > 7

                  const ownershipConfig = {
                    agency_billed: {
                      label: "Billed to Client",
                      variant: "warning" as const,
                      desc: "Invoice client upon renewal",
                    },
                    agency_absorbed: {
                      label: "Agency Absorbed",
                      variant: "neutral" as const,
                      desc: "Retainer expense",
                    },
                    client_direct: {
                      label: "Client Direct",
                      variant: "info" as const,
                      desc: "Client pays provider directly",
                    },
                  }

                  return (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className={`hover:bg-muted/20 transition-colors ${
                        isCritical ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      <td className="p-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.type === "domain"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {item.type === "domain" ? (
                              <Globe className="h-4 w-4" />
                            ) : (
                              <Server className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {item.subtext}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <Link
                          href={`/clients/${item.client_id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                        >
                          {item.client_name}
                        </Link>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {formatDate(item.expiration_date)}
                          </span>
                          <div className="mt-0.5">
                            {isCritical ? (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1 font-bold animate-pulse">
                                In {daysLeft} Days
                              </Badge>
                            ) : isUpcoming ? (
                              <Badge variant="warning" className="text-[10px] py-0 px-1 font-bold">
                                In {daysLeft} Days
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                In {daysLeft} Days
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-foreground">
                        {formatCurrency(item.renewal_cost, item.currency)}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <Badge
                            variant={ownershipConfig[item.renewal_ownership]?.variant || "neutral"}
                            className="text-[10px] py-0 px-1.5"
                          >
                            {ownershipConfig[item.renewal_ownership]?.label || item.renewal_ownership}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {ownershipConfig[item.renewal_ownership]?.desc}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <Link href={`/invoices/new`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1 font-semibold"
                            title="Generate invoice line for this renewal"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Invoice</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                    No technical renewals matching selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
