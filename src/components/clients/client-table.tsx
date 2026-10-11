"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Edit,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import type { Client, ClientStatus } from "@/types/client.types"

interface ClientTableProps {
  initialClients: Client[]
  onEditClient?: (client: Client) => void
}

export function ClientTable({ initialClients, onEditClient }: ClientTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState<Client[]>(initialClients)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    setData(initialClients)
  }, [initialClients])

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
          (item.company_name && item.company_name.toLowerCase().includes(q)) ||
          (item.contact_person && item.contact_person.toLowerCase().includes(q)) ||
          item.email.toLowerCase().includes(q) ||
          item.client_code.toLowerCase().includes(q)
      )
    }
    return result
  }, [data, statusFilter, globalFilter])

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Client & Code</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const client = row.original
        const initials = client.name.substring(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-lg border bg-primary/10">
              <AvatarFallback className="text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                href={`/clients/${client.id}`}
                className="font-bold text-foreground hover:text-primary transition-colors hover:underline text-sm"
              >
                {client.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono text-[11px] font-semibold text-primary/80">
                  {client.client_code}
                </span>
                {client.company_name && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{client.company_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">
              {client.contact_person || "—"}
            </span>
            <span className="text-muted-foreground truncate max-w-[180px]">
              {client.email}
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
        const statusMap: Record<ClientStatus, { label: string; variant: "success" | "warning" | "neutral" | "destructive" }> = {
          active: { label: "Active", variant: "success" },
          lead: { label: "Lead", variant: "warning" },
          inactive: { label: "Inactive", variant: "neutral" },
          archived: { label: "Archived", variant: "destructive" },
        }
        const config = statusMap[status] || { label: status, variant: "neutral" }
        return (
          <Badge variant={config.variant} className="capitalize text-[10px] py-0 px-2 font-semibold">
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-foreground">
          {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "lifetime_invoiced",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Lifetime Invoiced</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-foreground">
          {formatCurrency(row.original.lifetime_invoiced || 0, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "outstanding_balance",
      header: "Outstanding",
      cell: ({ row }) => {
        const balance = row.original.outstanding_balance || 0
        return (
          <div className="text-xs font-semibold">
            {balance > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {formatCurrency(balance, row.original.currency)}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Settled</span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Link href={`mailto:${client.email}`}>
              <Button
                variant="ghost"
                size="iconSm"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Send Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {onEditClient && (
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => onEditClient(client)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Edit Client"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            <Link href={`/clients/${client.id}`}>
              <Button
                variant="ghost"
                size="iconSm"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="View Profile"
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
            placeholder="Search by client, code, contact or email..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "active", "lead", "inactive"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="h-8 text-xs capitalize shrink-0"
            >
              {status === "all" ? "All Clients" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                  <td colSpan={columns.length} className="h-32 text-center text-muted-foreground text-xs">
                    No clients found matching the search criteria.
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
            clients
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
