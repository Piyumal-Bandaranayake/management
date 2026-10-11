"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  FileSpreadsheet,
} from "lucide-react"
import type { FinancialTransaction } from "@/types/finance.types"

interface TransactionLedgerTableProps {
  transactions: FinancialTransaction[]
}

export function TransactionLedgerTable({ transactions }: TransactionLedgerTableProps) {
  const [search, setSearch] = useState("")
  const [tabFilter, setTabFilter] = useState<"all" | "inflow" | "outflow">("all")

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.party.toLowerCase().includes(search.toLowerCase()) ||
        (t.reference_number && t.reference_number.toLowerCase().includes(search.toLowerCase()))

      const matchesTab = tabFilter === "all" || t.type === tabFilter

      return matchesSearch && matchesTab
    })
  }, [transactions, search, tabFilter])

  const exportToCsv = () => {
    const headers = ["Date", "Type", "Code", "Title", "Category", "Party", "Amount", "Currency", "Base Amount (LKR)", "Method", "Reference"]
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      t.code,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      `"${t.party.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.base_amount,
      t.payment_method,
      t.reference_number || "",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `AgencyFlow_CashFlow_Ledger_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = useMemo<ColumnDef<FinancialTransaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Flow Type",
        cell: ({ row }) => {
          const isInflow = row.original.type === "inflow"
          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold gap-1 px-2 py-0.5 ${
                isInflow
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300"
              }`}
            >
              {isInflow ? (
                <ArrowDownLeft className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              {isInflow ? "+INFLOW" : "-OUTFLOW"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "code",
        header: "Code & Source",
        cell: ({ row }) => {
          const t = row.original
          return (
            <div>
              <span className="font-mono font-bold text-xs text-foreground">
                {t.code}
              </span>
              <div className="text-[11px] text-muted-foreground capitalize">
                {t.category}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "title",
        header: "Description & Counterparty",
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="max-w-[280px]">
              <div className="font-semibold text-xs truncate">{t.title}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                Party: <span className="text-foreground font-medium">{t.party}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "payment_method",
        header: "Method & Ref",
        cell: ({ row }) => {
          const t = row.original
          return (
            <div>
              <span className="text-xs capitalize text-foreground">
                {t.payment_method.replace("_", " ")}
              </span>
              <div className="text-[11px] font-mono text-muted-foreground truncate">
                {t.reference_number || "—"}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "base_amount",
        header: () => <div className="text-right">Net Flow (LKR)</div>,
        cell: ({ row }) => {
          const t = row.original
          const isInflow = t.type === "inflow"
          return (
            <div className="text-right">
              <div
                className={`font-bold text-xs ${
                  isInflow
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isInflow ? "+" : "-"}LKR{" "}
                {Number(t.base_amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              {t.currency !== "LKR" && (
                <div className="text-[10px] text-muted-foreground">
                  {t.currency} {Number(t.amount).toLocaleString()}
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
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 12 },
    },
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transaction code, title, party, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Tabs
            value={tabFilter}
            onValueChange={(val: any) => setTabFilter(val)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All Flows
              </TabsTrigger>
              <TabsTrigger value="inflow" className="text-xs text-emerald-600 dark:text-emerald-400">
                Inflows (+)
              </TabsTrigger>
              <TabsTrigger value="outflow" className="text-xs text-rose-600 dark:text-rose-400">
                Outflows (-)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCsv}
            className="h-9 text-xs gap-1.5"
            title="Export transactions to CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
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
                    No cash flow transactions recorded matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{filteredTransactions.length}</span> cash flow records
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
    </div>
  )
}
