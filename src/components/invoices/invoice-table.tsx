"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  MoreHorizontal,
  CreditCard,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  ArrowUpDown,
} from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/types/invoice.types"
import { RecordPaymentDialog } from "./record-payment-dialog"
import { updateInvoiceStatusAction } from "@/actions/invoices.actions"
import { toast } from "sonner"

interface InvoiceTableProps {
  invoices: Invoice[]
  onRefresh?: () => void
}

export function InvoiceTable({ invoices, onRefresh }: InvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issue_date", desc: true },
  ])
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState<Invoice | null>(null)

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    try {
      await updateInvoiceStatusAction(id, status)
      toast.success(`Invoice status updated to ${status.replace("_", " ")}`)
      onRefresh?.()
    } catch {
      toast.error("Failed to update invoice status.")
    }
  }

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Invoice #
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const inv = row.original
          return (
            <div>
              <Link
                href={`/invoices/${inv.id}`}
                className="font-bold text-xs hover:underline text-primary flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {inv.invoice_number}
              </Link>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Issued {inv.issue_date}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "client_name",
        header: "Client & Project",
        cell: ({ row }) => {
          const inv = row.original
          return (
            <div className="max-w-[220px]">
              <div className="font-semibold text-xs truncate">
                {inv.client_name || "Unknown Client"}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {inv.project_name ? (
                  <span>Project: {inv.project_name}</span>
                ) : (
                  <span className="italic">Direct Account Billing</span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const inv = row.original
          const isOverdue =
            new Date(inv.due_date) < new Date() &&
            Number(inv.balance_due) > 0 &&
            inv.status !== "void"

          return (
            <div>
              <div
                className={`text-xs font-medium ${
                  isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : ""
                }`}
              >
                {inv.due_date}
              </div>
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "total_amount",
        header: () => <div className="text-right">Total Amount</div>,
        cell: ({ row }) => {
          const inv = row.original
          return (
            <div className="text-right">
              <div className="font-bold text-xs">
                {inv.currency}{" "}
                {Number(inv.total_amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              {inv.tax_amount > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  incl. {inv.tax_rate}% tax
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "balance_due",
        header: () => <div className="text-right">Paid / Balance Due</div>,
        cell: ({ row }) => {
          const inv = row.original
          const paid = Number(inv.amount_paid)
          const balance = Number(inv.balance_due)

          return (
            <div className="text-right">
              <div
                className={`text-xs font-semibold ${
                  balance === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                Due: {inv.currency}{" "}
                {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Paid: {inv.currency}{" "}
                {paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status

          const statusConfig: Record<
            InvoiceStatus,
            { label: string; className: string; icon: any }
          > = {
            draft: {
              label: "Draft",
              className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              icon: Clock,
            },
            sent: {
              label: "Sent",
              className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              icon: FileText,
            },
            partially_paid: {
              label: "Partially Paid",
              className:
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700",
              icon: Clock,
            },
            paid: {
              label: "Paid",
              className:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
              icon: CheckCircle2,
            },
            overdue: {
              label: "Overdue",
              className:
                "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-700",
              icon: AlertTriangle,
            },
            void: {
              label: "Void",
              className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 line-through",
              icon: Ban,
            },
          }

          const current = statusConfig[status] || statusConfig.draft
          const Icon = current.icon

          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold gap-1 px-2 py-0.5 border ${current.className}`}
            >
              <Icon className="h-3 w-3" />
              {current.label}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inv = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/invoices/${inv.id}`} className="cursor-pointer gap-2">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/invoices/${inv.id}/preview`}
                    className="cursor-pointer gap-2"
                  >
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    Print / PDF Document
                  </Link>
                </DropdownMenuItem>

                {Number(inv.balance_due) > 0 && inv.status !== "void" && (
                  <DropdownMenuItem
                    onClick={() => setSelectedInvoiceForPayment(inv)}
                    className="cursor-pointer gap-2 font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Record Payment
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                  Change Status
                </DropdownMenuLabel>
                {inv.status !== "sent" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, "sent")}>
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                {inv.status !== "paid" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, "paid")}>
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                {inv.status !== "void" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(inv.id, "void")}
                    className="text-destructive"
                  >
                    Mark as Void
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <>
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
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors data-[state=selected]:bg-muted/50"
                  >
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
                    No agency invoices found matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                invoices.length
              )}
            </span>{" "}
            of <span className="font-medium text-foreground">{invoices.length}</span> invoices
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

      {selectedInvoiceForPayment && (
        <RecordPaymentDialog
          invoice={selectedInvoiceForPayment}
          open={!!selectedInvoiceForPayment}
          onOpenChange={(open) => !open && setSelectedInvoiceForPayment(null)}
          onSuccess={() => {
            setSelectedInvoiceForPayment(null)
            onRefresh?.()
          }}
        />
      )}
    </>
  )
}
