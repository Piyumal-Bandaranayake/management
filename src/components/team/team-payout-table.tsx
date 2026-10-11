"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building,
  Globe,
  Wallet,
  Shield,
  CreditCard,
  Briefcase,
} from "lucide-react"
import type { TeamPayment } from "@/types/team.types"

interface TeamPayoutTableProps {
  payments: TeamPayment[]
}

export function TeamPayoutTable({ payments }: TeamPayoutTableProps) {
  const columns = useMemo<ColumnDef<TeamPayment>[]>(
    () => [
      {
        accessorKey: "payment_code",
        header: "Code & Date",
        cell: ({ row }) => {
          const p = row.original
          return (
            <div>
              <span className="font-mono font-bold text-xs text-foreground">
                {p.payment_code}
              </span>
              <div className="text-[11px] text-muted-foreground">{p.payment_date}</div>
            </div>
          )
        },
      },
      {
        accessorKey: "team_member_name",
        header: "Team Member",
        cell: ({ row }) => {
          const p = row.original
          return (
            <div>
              <Link
                href={`/team/${p.team_member_id}`}
                className="font-bold text-xs hover:underline text-primary"
              >
                {p.team_member_name || "Team Member"}
              </Link>
              <div className="text-[11px] text-muted-foreground">
                {p.team_member_designation || "Staff"}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "project_name",
        header: "Project Context",
        cell: ({ row }) => {
          const p = row.original
          if (!p.project_id) {
            return <span className="text-xs text-muted-foreground italic">General Retainer</span>
          }
          return (
            <Link
              href={`/projects/${p.project_id}`}
              className="text-xs text-primary hover:underline font-medium block truncate max-w-[200px]"
            >
              {p.project_name || "Project"}
            </Link>
          )
        },
      },
      {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.payment_method
          const methodMap: Record<string, any> = {
            bank_transfer: Building,
            wise: Globe,
            cash: Wallet,
            credit_card: CreditCard,
          }
          const Icon = methodMap[method] || CreditCard

          return (
            <Badge
              variant="outline"
              className="text-[11px] font-medium gap-1 px-2 py-0.5 capitalize bg-muted/40"
            >
              <Icon className="h-3 w-3 text-muted-foreground" />
              {method.replace("_", " ")}
            </Badge>
          )
        },
      },
      {
        accessorKey: "reference_number",
        header: "Reference #",
        cell: ({ row }) => {
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.reference_number || "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Payout Amount</div>,
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="text-right">
              <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                -LKR{" "}
                {Number(p.base_amount || p.amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              {p.currency !== "LKR" && (
                <div className="text-[10px] text-muted-foreground">
                  {p.currency} {Number(p.amount).toLocaleString()}
                </div>
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3.5 first:pl-4 last:pr-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3.5 first:pl-4 last:pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center text-muted-foreground text-xs">
                  No contractor payout transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{payments.length}</span> payout records
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs px-2.5"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs px-2.5"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
