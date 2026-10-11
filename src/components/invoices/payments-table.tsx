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
  CreditCard,
  Building,
  Globe,
  Wallet,
  FileCheck,
  Receipt,
} from "lucide-react"
import type { ClientPayment, PaymentMethod } from "@/types/invoice.types"

interface PaymentsTableProps {
  payments: ClientPayment[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const columns = useMemo<ColumnDef<ClientPayment>[]>(
    () => [
      {
        accessorKey: "payment_code",
        header: "Receipt / Code",
        cell: ({ row }) => {
          const pay = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground font-mono">
                  {pay.payment_code}
                </span>
                <div className="text-[11px] text-muted-foreground">{pay.payment_date}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "client_name",
        header: "Client & Project",
        cell: ({ row }) => {
          const pay = row.original
          return (
            <div>
              <div className="font-semibold text-xs">{pay.client_name || "Client"}</div>
              <div className="text-[11px] text-muted-foreground">
                {pay.project_name || "Direct Billing"}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: ({ row }) => {
          const method = row.original.payment_method
          const methodIcons: Record<PaymentMethod, any> = {
            bank_transfer: Building,
            wise: Globe,
            credit_card: CreditCard,
            payoneer: Globe,
            cash: Wallet,
            cheque: Receipt,
            other: CreditCard,
          }
          const Icon = methodIcons[method] || CreditCard

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
        header: "Reference / Transaction #",
        cell: ({ row }) => {
          const ref = row.original.reference_number
          return (
            <div className="font-mono text-xs text-muted-foreground">
              {ref || "—"}
            </div>
          )
        },
      },
      {
        id: "allocated_invoices",
        header: "Applied To Invoices",
        cell: ({ row }) => {
          const allocs = row.original.allocated_invoices || []
          if (allocs.length === 0) {
            return <span className="text-xs text-muted-foreground">Unallocated</span>
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {allocs.map((a, i) => (
                <Link
                  key={i}
                  href={`/invoices/${a.invoice_id}`}
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:underline font-mono"
                >
                  <Receipt className="h-3 w-3" />
                  {a.invoice_number}
                </Link>
              ))}
            </div>
          )
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount Received</div>,
        cell: ({ row }) => {
          const pay = row.original
          return (
            <div className="text-right">
              <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                +{pay.currency}{" "}
                {Number(pay.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              {pay.currency !== "LKR" && (
                <div className="text-[10px] text-muted-foreground">
                  LKR {Number(pay.base_amount).toLocaleString()}
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
                  No verified client cash payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{payments.length}</span> payment records
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
