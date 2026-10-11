"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building,
  Mail,
  Phone,
  Briefcase,
  Wallet,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react"
import type { TeamMember } from "@/types/team.types"
import { TeamPayoutDialog } from "./team-payout-dialog"

interface TeamMemberDetailTabsProps {
  member: TeamMember
}

export function TeamMemberDetailTabs({ member }: TeamMemberDetailTabsProps) {
  const router = useRouter()
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const assignments = member.assignments || []
  const payments = member.payments || []

  return (
    <div className="space-y-6">
      {/* 1. Profile Header Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-lg font-bold border-2 border-primary/20">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight">{member.full_name}</h1>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold px-2 py-0.5 capitalize bg-primary/10 text-primary border-primary/20"
                  >
                    {member.employment_type.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {member.designation}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </span>
                  {member.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {member.phone}
                    </span>
                  )}
                  <span className="font-semibold text-foreground">
                    Rate: {member.currency} {Number(member.default_rate || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowPayoutModal(true)}
              className="text-xs h-9 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Disburse Payout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Agreed Commitments
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5">
                LKR {Number(member.total_agreed_fees || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Across {assignments.length} assigned projects
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Total Paid Out
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">
                LKR {Number(member.total_paid || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                Verified settlements
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Pending Payout
              </p>
              <h3
                className={`text-xl font-bold tracking-tight mt-0.5 ${
                  Number(member.pending_payout || 0) > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                LKR {Number(member.pending_payout || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Milestones awaiting payment
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Bank Settlement
              </p>
              <h3 className="text-sm font-bold tracking-tight mt-0.5 truncate max-w-[150px]">
                {member.bank_account_details ? "Bank Account Linked" : "No Bank Added"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Direct wire transfer
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Building className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detail Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="assignments" className="text-xs">
            Project Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs">
            Payout History ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs">
            Profile & Bank Details
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Project Assignments */}
        <TabsContent value="assignments">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assigned Project Milestones</CardTitle>
              <CardDescription className="text-xs">
                Active project commitments and compensation milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 border-y border-border/60 font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2">Project</th>
                        <th className="py-2.5 px-3">Role In Project</th>
                        <th className="py-2.5 px-3">Agreed Fee</th>
                        <th className="py-2.5 pr-4 text-right">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {assignments.map((asg: any) => (
                        <tr key={asg.id}>
                          <td className="py-3 pl-4 pr-2">
                            <Link
                              href={`/projects/${asg.project_id}`}
                              className="font-bold text-primary hover:underline"
                            >
                              {asg.project_name || "Project"}
                            </Link>
                            {asg.project_code && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {asg.project_code}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium">{asg.role_in_project}</td>
                          <td className="py-3 px-3 font-semibold">
                            {asg.currency} {Number(asg.agreed_fee).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize font-semibold ${
                                asg.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                                  : asg.payment_status === "partially_paid"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
                                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {asg.payment_status?.replace("_", " ") || "unpaid"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Briefcase className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                  No project assignments recorded for this member.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payout History */}
        <TabsContent value="payouts">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payout Disbursements</CardTitle>
              <CardDescription className="text-xs">
                Realized compensation payments disbursed to this team member
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 border-y border-border/60 font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2">Receipt Code</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Reference #</th>
                        <th className="py-2.5 pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 pl-4 pr-2 font-mono font-bold text-foreground">
                            {p.payment_code}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{p.payment_date}</td>
                          <td className="py-3 px-3 capitalize">
                            {p.payment_method?.replace("_", " ")}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">
                            {p.reference_number || "—"}
                          </td>
                          <td className="py-3 pr-4 text-right font-bold text-rose-600 dark:text-rose-400">
                            -LKR {Number(p.base_amount || p.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                  No payments disbursed to this member yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Profile & Bank Details */}
        <TabsContent value="profile">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile & Banking Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Registered Bank Account</span>
                  <div className="p-3 rounded-lg border bg-muted/20 font-mono text-foreground">
                    {member.bank_account_details || "No bank details recorded yet."}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Technical Skills</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.skills && member.skills.length > 0 ? (
                      member.skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic">No skills listed.</span>
                    )}
                  </div>
                </div>
              </div>

              {member.notes && (
                <div className="space-y-1 pt-2">
                  <span className="text-muted-foreground block text-[11px]">Internal Notes</span>
                  <p className="text-muted-foreground leading-relaxed">{member.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showPayoutModal && (
        <TeamPayoutDialog
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          teamMembers={[member]}
          initialMemberId={member.id}
          onSuccess={() => {
            setShowPayoutModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
