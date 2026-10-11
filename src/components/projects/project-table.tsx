"use client"

import * as React from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Layers,
  Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Project, ProjectStatus, ProjectPriority } from "@/types/project.types"

interface ProjectTableProps {
  initialProjects: Project[]
}

export function ProjectTable({ initialProjects }: ProjectTableProps) {
  const [data, setData] = React.useState<Project[]>(initialProjects)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    setData(initialProjects)
  }, [initialProjects])

  const filteredData = React.useMemo(() => {
    let result = data
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter)
    }
    if (globalFilter.trim()) {
      const q = globalFilter.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.project_code.toLowerCase().includes(q) ||
          (item.client_name && item.client_name.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q))
      )
    }
    return result
  }, [data, statusFilter, globalFilter])

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Project & Code</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex flex-col">
            <Link
              href={`/projects/${project.id}`}
              className="font-bold text-foreground hover:text-primary transition-colors hover:underline text-sm"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono text-[11px] font-semibold text-primary/80">
                {project.project_code}
              </span>
              {project.category && (
                <>
                  <span>•</span>
                  <span>{project.category}</span>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "client_name",
      header: "Client Account",
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-foreground">
              {project.client_name || "—"}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {project.client_code || ""}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const statusMap: Record<
          ProjectStatus,
          { label: string; variant: "success" | "warning" | "info" | "neutral" | "destructive" }
        > = {
          lead: { label: "Lead", variant: "warning" },
          planning: { label: "Planning", variant: "info" },
          in_progress: { label: "In Progress", variant: "success" },
          review: { label: "Review", variant: "warning" },
          completed: { label: "Completed", variant: "neutral" },
          on_hold: { label: "On Hold", variant: "neutral" },
          cancelled: { label: "Cancelled", variant: "destructive" },
        }
        const config = statusMap[status] || { label: status, variant: "neutral" }
        return (
          <Badge variant={config.variant} className="text-[10px] py-0 px-2 font-semibold">
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority
        const priorityColor: Record<ProjectPriority, string> = {
          urgent: "text-red-600 bg-red-500/10 border-red-500/20",
          high: "text-amber-600 bg-amber-500/10 border-amber-500/20",
          medium: "text-blue-600 bg-blue-500/10 border-blue-500/20",
          low: "text-slate-600 bg-slate-500/10 border-slate-500/20",
        }
        return (
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
              priorityColor[priority] || "text-slate-600"
            }`}
          >
            {priority}
          </span>
        )
      },
    },
    {
      accessorKey: "expected_delivery_date",
      header: "Delivery Date",
      cell: ({ row }) => {
        const delivery = row.original.expected_delivery_date
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(delivery)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "contract_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Contract Value</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-bold text-xs text-foreground">
          {formatCurrency(row.original.contract_amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "margin_percentage",
      header: "Margin",
      cell: ({ row }) => {
        const margin = row.original.margin_percentage ?? 0
        const marginColor =
          margin >= 70
            ? "text-emerald-600 dark:text-emerald-400 font-bold"
            : margin >= 50
            ? "text-blue-600 dark:text-blue-400 font-bold"
            : "text-amber-600 dark:text-amber-400 font-bold"
        return (
          <span className={`text-xs ${marginColor}`}>
            {margin}%
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center justify-end">
            <Link href={`/projects/${project.id}`}>
              <Button
                variant="ghost"
                size="iconSm"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="View Details"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project, code, client, or category..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "in_progress", "planning", "completed", "review", "lead"] as const).map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="h-8 text-xs capitalize shrink-0"
              >
                {status === "all" ? "All Projects" : status.replace("_", " ")}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 sm:px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 sm:px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground text-xs"
                  >
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {table.getRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {filteredData.length}
            </span>{" "}
            projects
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
