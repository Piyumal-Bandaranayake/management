"use client"

import * as React from "react"
import Link from "next/link"
import { Server, AlertTriangle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { HostingService } from "@/types/domain-hosting.types"

interface HostingTableProps {
  hosting: HostingService[]
}

export function HostingTable({ hosting }: HostingTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              <th className="p-3 px-4">Provider & Plan</th>
              <th className="p-3">Client & Project</th>
              <th className="p-3">Server Ref</th>
              <th className="p-3">Next Renewal</th>
              <th className="p-3">Renewal Cost</th>
              <th className="p-3">Cycle</th>
              <th className="p-3 text-right">Who Pays</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hosting.length > 0 ? (
              hosting.map((host) => {
                const daysLeft = host.days_until_expiration ?? 999
                const isCritical = daysLeft <= 7
                const isUpcoming = daysLeft <= 14 && daysLeft > 7
                const isNotice = daysLeft <= 30 && daysLeft > 14

                const ownershipMap = {
                  agency_billed: { label: "Billed to Client", variant: "warning" as const },
                  agency_absorbed: { label: "Agency Retainer", variant: "neutral" as const },
                  client_direct: { label: "Client Direct", variant: "info" as const },
                }

                return (
                  <tr key={host.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <Server className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {host.provider}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {host.plan_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/clients/${host.client_id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                        >
                          {host.client_name || "Client"}
                        </Link>
                        {host.project_name && (
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {host.project_name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-muted-foreground">
                      {host.server_reference || "—"}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {formatDate(host.expiration_date)}
                        </span>
                        <div className="mt-0.5">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 animate-pulse">
                              <AlertTriangle className="h-3 w-3" />
                              Expires in {daysLeft} days!
                            </span>
                          ) : isUpcoming ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              Expires in {daysLeft} days
                            </span>
                          ) : isNotice ? (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                              In {daysLeft} days
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              In {daysLeft} days
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-foreground">
                      {formatCurrency(host.renewal_cost, host.currency)}
                    </td>

                    <td className="p-3 capitalize text-muted-foreground">
                      {host.billing_cycle}
                    </td>

                    <td className="p-3 text-right">
                      <Badge
                        variant={ownershipMap[host.renewal_ownership]?.variant || "neutral"}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {ownershipMap[host.renewal_ownership]?.label || host.renewal_ownership}
                      </Badge>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="h-28 text-center text-muted-foreground text-xs">
                  No hosting accounts recorded. Click &quot;Add Hosting&quot; to configure servers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
