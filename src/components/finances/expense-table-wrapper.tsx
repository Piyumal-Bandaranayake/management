"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Search, Plus, Building, Briefcase, DollarSign } from "lucide-react"
import { ExpenseTable } from "./expense-table"
import { ExpenseDialog } from "./expense-dialog"
import type { Expense } from "@/types/finance.types"
import type { Project } from "@/types/project.types"

interface ExpenseTableWrapperProps {
  initialExpenses: Expense[]
  projects: Project[]
}

export function ExpenseTableWrapper({
  initialExpenses,
  projects,
}: ExpenseTableWrapperProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const operationalSum = initialExpenses
    .filter((e) => e.expense_type === "operational")
    .reduce((sum, e) => sum + Number(e.base_amount || e.amount), 0)

  const projectSum = initialExpenses
    .filter((e) => e.expense_type === "project")
    .reduce((sum, e) => sum + Number(e.base_amount || e.amount), 0)

  const totalSum = operationalSum + projectSum

  const filteredExpenses = initialExpenses.filter((e) => {
    const matchesSearch =
      search === "" ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.expense_code.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
      (e.project_name && e.project_name.toLowerCase().includes(search.toLowerCase()))

    const matchesType = typeFilter === "all" || e.expense_type === typeFilter
    const matchesCategory =
      categoryFilter === "all" || e.category === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Expenses
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-rose-600 dark:text-rose-400">
                LKR {totalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {initialExpenses.length} expense entries recorded
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Operational Overhead
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-blue-600 dark:text-blue-400">
                LKR {operationalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                SaaS, infrastructure & rent
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Project-Attributed Costs
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
                LKR {projectSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Assets, custom APIs & licenses
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Controls & Actions toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, vendor, code, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[145px] text-xs h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="project">Project Cost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] text-xs h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="software_subscription">Software / SaaS</SelectItem>
              <SelectItem value="cloud_hosting">Cloud Hosting</SelectItem>
              <SelectItem value="project_assets">Project Assets</SelectItem>
              <SelectItem value="subcontractor_fee">Subcontractor</SelectItem>
              <SelectItem value="office_rent">Office Rent</SelectItem>
              <SelectItem value="utilities_internet">Utilities</SelectItem>
              <SelectItem value="marketing_ads">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-9 text-xs gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* 3. Expense Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        onRefresh={() => router.refresh()}
      />

      {/* 4. Modal */}
      {showAddModal && (
        <ExpenseDialog
          open={showAddModal}
          onOpenChange={setShowAddModal}
          projects={projects}
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
