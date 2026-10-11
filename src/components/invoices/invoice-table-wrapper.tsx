"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, CreditCard, RotateCcw } from "lucide-react"
import { InvoiceStatHeader } from "./invoice-stat-header"
import { InvoiceTable } from "./invoice-table"
import type { Invoice, InvoiceStatus } from "@/types/invoice.types"

interface InvoiceTableWrapperProps {
  initialInvoices: Invoice[]
}

export function InvoiceTableWrapper({ initialInvoices }: InvoiceTableWrapperProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInvoices = initialInvoices.filter((inv) => {
    const matchesSearch =
      search === "" ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.client_name && inv.client_name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.project_name && inv.project_name.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats */}
      <InvoiceStatHeader invoices={initialInvoices} />

      {/* 2. Controls & Actions toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, client, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[145px] text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-9 w-9 shrink-0"
            title="Refresh list"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/invoices/payments">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              Client Payments
            </Link>
          </Button>
          <Button size="sm" asChild className="h-9 text-xs gap-1.5 font-semibold">
            <Link href="/invoices/new">
              <Plus className="h-3.5 w-3.5" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. Invoices Table */}
      <InvoiceTable invoices={filteredInvoices} onRefresh={handleRefresh} />
    </div>
  )
}
