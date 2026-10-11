"use client"

import { useState } from "react"
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
import { Search, Plus, CreditCard, Shield } from "lucide-react"
import { TeamStatHeader } from "./team-stat-header"
import { TeamTable } from "./team-table"
import { TeamMemberDialog } from "./team-member-dialog"
import { TeamPayoutDialog } from "./team-payout-dialog"
import type { TeamMember, TeamStatSummary } from "@/types/team.types"

interface TeamTableWrapperProps {
  initialMembers: TeamMember[]
  summary: TeamStatSummary
}

export function TeamTableWrapper({
  initialMembers,
  summary,
}: TeamTableWrapperProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  const filteredMembers = initialMembers.filter((m) => {
    const matchesSearch =
      search === "" ||
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === "all" || m.employment_type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats */}
      <TeamStatHeader summary={summary} />

      {/* 2. Controls & Actions toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, designation, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[155px] text-xs h-9">
              <SelectValue placeholder="All Staff Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff Types</SelectItem>
              <SelectItem value="full_time">Full-Time</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="part_time">Part-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/team/payments">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              Payouts Ledger
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPayoutModal(true)}
            className="h-9 text-xs gap-1.5 font-medium"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Disburse Payout
          </Button>
          <Button
            size="sm"
            onClick={() => setShowMemberModal(true)}
            className="h-9 text-xs gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Button>
        </div>
      </div>

      {/* 3. Team Table */}
      <TeamTable
        teamMembers={filteredMembers}
        onRefresh={() => router.refresh()}
      />

      {/* 4. Modals */}
      {showMemberModal && (
        <TeamMemberDialog
          open={showMemberModal}
          onOpenChange={setShowMemberModal}
          onSuccess={() => {
            setShowMemberModal(false)
            router.refresh()
          }}
        />
      )}

      {showPayoutModal && (
        <TeamPayoutDialog
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          teamMembers={initialMembers}
          onSuccess={() => {
            setShowPayoutModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
