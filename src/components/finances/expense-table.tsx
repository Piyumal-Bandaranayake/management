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
  Trash2,
  Building,
  Briefcase,
  DollarSign,
  CreditCard,
  Receipt,
} from "lucide-react"
import type { Expense } from "@/types/finance.types"
import { deleteExpenseAction } from "@/actions/finances.actions"
import { toast } from "sonner"

interface ExpenseTableProps {
  expenses: Expense[]
  onRefresh?: () => void
}

export function ExpenseTable({ expenses, onRefresh }: ExpenseTableProps) {
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete expense "${title}"?`)) return
    try {
      await deleteExpenseAction(id)
      toast.success("Expense removed")
      onRefresh?.()
    } catch {
      toast.error("Failed to delete expense")
    }
  }

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "expense_code",
        header: "Code & Date",
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div>
              <span className="font-mono font-bold text-xs text-foreground">
                {exp.expense_code}
              </span>
              <div className="text-[11px] text-muted-foreground">{exp.expense_date}</div>
            </div>
          )
        },
      },
      {
        accessorKey: "title",
        header: "Expense & Vendor",
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div className="max-w-[240px]">
              <div className="font-semibold text-xs truncate">{exp.title}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {exp.vendor ? `Vendor: ${exp.vendor}` : "Direct Agency Expense"}
                {exp.reference_number && ` • Ref: ${exp.reference_number}`}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "expense_type",
        header: "Type",
        cell: ({ row }) => {
          const isOperational = row.original.expense_type === "operational"
          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold gap-1 px-2 py-0.5 ${
                isOperational
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
              }`}
            >
              {isOperational ? (
                <Building className="h-3 w-3" />
              ) : (
                <Briefcase className="h-3 w-3" />
              )}
              {isOperational ? "Operational" : "Project"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          return (
            <span className="text-xs text-muted-foreground capitalize">
              {row.original.category.replace("_", " ")}
            </span>
          )
        },
      },
      {
        accessorKey: "project_name",
        header: "Linked Project",
        cell: ({ row }) => {
          const exp = row.original
          if (!exp.project_id) {
            return <span className="text-xs text-muted-foreground italic">Agency General</span>
          }
          return (
            <Link
              href={`/projects/${exp.project_id}`}
              className="text-xs text-primary hover:underline font-medium block max-w-[160px] truncate"
            >
              {exp.project_name || "Project"}
            </Link>
          )
        },
      },
      {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => {
          return (
            <span className="text-xs text-muted-foreground capitalize">
              {row.original.payment_method.replace("_", " ")}
            </span>
          )
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Outflow Amount</div>,
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div className="text-right">
              <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                -{exp.currency}{" "}
                {Number(exp.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              {exp.currency !== "LKR" && (
                <div className="text-[10px] text-muted-foreground">
                  LKR {Number(exp.base_amount).toLocaleString()}
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(exp.id, exp.title)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete expense"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: expenses,
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
                  No business expenses recorded matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{expenses.length}</span> expenses
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
