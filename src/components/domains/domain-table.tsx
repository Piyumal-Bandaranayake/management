"use client"

import * as React from "react"
import Link from "next/link"
import { Globe, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Domain } from "@/types/domain-hosting.types"

interface DomainTableProps {
  domains: Domain[]
}

export function DomainTable({ domains }: DomainTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              <th className="p-3 px-4">Domain Name</th>
              <th className="p-3">Client & Project</th>
              <th className="p-3">Registrar</th>
              <th className="p-3">Expiration Date</th>
              <th className="p-3">Renewal Cost</th>
              <th className="p-3">Who Pays</th>
              <th className="p-3 text-right">Auto-Renew</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {domains.length > 0 ? (
              domains.map((dom) => {
                const daysLeft = dom.days_until_expiration ?? 999
                const isCritical = daysLeft <= 7
                const isUpcoming = daysLeft <= 14 && daysLeft > 7
                const isNotice = daysLeft <= 30 && daysLeft > 14

                const ownershipMap = {
                  agency_billed: { label: "Billed to Client", variant: "warning" as const },
                  agency_absorbed: { label: "Agency Retainer", variant: "neutral" as const },
                  client_direct: { label: "Client Direct", variant: "info" as const },
                }

                return (
                  <tr key={dom.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Globe className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {dom.domain_name}
                          </span>
                          {dom.dns_records_notes && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {dom.dns_records_notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/clients/${dom.client_id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                        >
                          {dom.client_name || "Client"}
                        </Link>
                        {dom.project_name && (
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {dom.project_name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-foreground">
                      {dom.registrar}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {formatDate(dom.expiration_date)}
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
                      {formatCurrency(dom.renewal_cost, dom.currency)}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={ownershipMap[dom.renewal_ownership]?.variant || "neutral"}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {ownershipMap[dom.renewal_ownership]?.label || dom.renewal_ownership}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      {dom.auto_renew ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Enabled</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Manual</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="h-28 text-center text-muted-foreground text-xs">
                  No domains registered. Click &quot;Add Domain&quot; to begin tracking assets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
