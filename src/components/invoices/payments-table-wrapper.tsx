"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ArrowLeft,
  DollarSign,
  Building,
  Globe,
  Receipt,
} from "lucide-react"
import { PaymentsTable } from "./payments-table"
import type { ClientPayment, PaymentMethod } from "@/types/invoice.types"

interface PaymentsTableWrapperProps {
  initialPayments: ClientPayment[]
}

export function PaymentsTableWrapper({ initialPayments }: PaymentsTableWrapperProps) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")

  const totalCollected = initialPayments.reduce(
    (sum, p) => sum + Number(p.base_amount || p.amount),
    0
  )

  const bankTransferTotal = initialPayments
    .filter((p) => p.payment_method === "bank_transfer")
    .reduce((sum, p) => sum + Number(p.base_amount || p.amount), 0)

  const intlTotal = initialPayments
    .filter((p) => p.payment_method === "wise" || p.payment_method === "payoneer")
    .reduce((sum, p) => sum + Number(p.base_amount || p.amount), 0)

  const filteredPayments = initialPayments.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.payment_code.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.reference_number && p.reference_number.toLowerCase().includes(search.toLowerCase()))

    const matchesMethod =
      methodFilter === "all" || p.payment_method === methodFilter

    return matchesSearch && matchesMethod
  })

  return (
    <div className="space-y-6">
      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Cash Inflows
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                LKR {totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {initialPayments.length} verified settlements
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bank Transfers
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">
                LKR {bankTransferTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Domestic bank settlements
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cross-Border (Wise / Payoneer)
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-blue-600 dark:text-blue-400">
                LKR {intlTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Foreign currency remittances
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipt code, client, or ref #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[160px] text-xs h-9">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="wise">Wise</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="cash">Cash In Hand</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="payoneer">Payoneer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/invoices">
              <Receipt className="h-3.5 w-3.5" />
              Invoices List
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. Table */}
      <PaymentsTable payments={filteredPayments} />
    </div>
  )
}
