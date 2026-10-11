"use client"

import * as React from "react"
import Link from "next/link"
import {
  Layers,
  Users,
  Globe,
  Receipt,
  CreditCard,
  DollarSign,
  FolderArchive,
  History,
  Plus,
  Trash2,
  Calendar,
  Building,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProjectProfitCard } from "@/components/projects/project-profit-card"
import { AssignmentDialog } from "@/components/projects/assignment-dialog"
import { removeAssignmentAction } from "@/actions/projects.actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import type { Project, TeamMember, ProjectAssignment } from "@/types/project.types"

interface ProjectDetailTabsProps {
  project: Project
  teamMembers: TeamMember[]
}

export function ProjectDetailTabs({ project, teamMembers }: ProjectDetailTabsProps) {
  const [assignments, setAssignments] = React.useState<ProjectAssignment[]>(
    project.assignments || []
  )
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)

  const totalAgreed = assignments.reduce((acc, a) => acc + (a.agreed_fee || 0), 0)
  const estimatedProfit = (project.contract_amount || 0) - (totalAgreed + (project.estimated_costs || 0))

  const handleAssignmentCreated = (newAssignment: ProjectAssignment) => {
    setAssignments((prev) => [...prev, newAssignment])
  }

  const handleRemoveAssignment = async (id: string) => {
    try {
      await removeAssignmentAction(id, project.id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
      toast.success("Assignment removed")
    } catch {
      toast.error("Failed to remove assignment")
    }
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Financial Profitability Card */}
      <ProjectProfitCard
        contractAmount={project.contract_amount}
        totalAgreedFees={totalAgreed}
        estimatedCosts={project.estimated_costs}
        currency={project.currency}
      />

      {/* Operational 8-Tab Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs gap-1.5 py-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>1. Overview</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1.5 py-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>2. Team ({assignments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="hosting" className="text-xs gap-1.5 py-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>3. Hosting & Domain</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs gap-1.5 py-1.5">
            <Receipt className="h-3.5 w-3.5" />
            <span>4. Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1.5 py-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            <span>5. Payments</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs gap-1.5 py-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span>6. Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs gap-1.5 py-1.5">
            <FolderArchive className="h-3.5 w-3.5" />
            <span>7. Files</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5 py-1.5">
            <History className="h-3.5 w-3.5" />
            <span>8. Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Specifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Project Scope & Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-foreground leading-relaxed">
                  {project.description || "No project description provided."}
                </p>

                {/* Tech Stack */}
                <div className="space-y-1.5 pt-2 border-t">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Technologies & Architecture
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.technologies && project.technologies.length > 0 ? (
                      project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[11px] font-medium">
                          {tech}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic">None specified</span>
                    )}
                  </div>
                </div>

                {project.notes && (
                  <div className="space-y-1 pt-2 border-t">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      Project Notes & Special Instructions
                    </span>
                    <p className="text-muted-foreground italic">{project.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline & Metadata */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Timeline & Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(project.start_date)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Target Delivery Date</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatDate(project.expected_delivery_date)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Actual Completion Date</span>
                  <span className="text-foreground">
                    {project.actual_completion_date ? formatDate(project.actual_completion_date) : "In Progress"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Associated Client</span>
                  <Link
                    href={`/clients/${project.client_id}`}
                    className="font-bold text-primary hover:underline"
                  >
                    {project.client_name} ({project.client_code})
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Team Assignments (Payroll & Commitments) */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Team Member Allocations</h3>
              <p className="text-xs text-muted-foreground">
                Assigned engineers, agreed project compensation, and payout reconciliation status.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign Member</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                      <th className="p-3 px-4">Team Member</th>
                      <th className="p-3">Project Role</th>
                      <th className="p-3">Agreed Fee</th>
                      <th className="p-3">Payout Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assignments.length > 0 ? (
                      assignments.map((asg) => {
                        const paymentStatusBadge: Record<string, "success" | "warning" | "neutral"> = {
                          paid: "success",
                          partially_paid: "warning",
                          unpaid: "neutral",
                        }
                        return (
                          <tr key={asg.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">
                                  {asg.team_member_name || "Assigned Engineer"}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {asg.team_member_designation || "Engineer"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-medium text-foreground">
                              {asg.role_in_project}
                            </td>
                            <td className="p-3 font-mono font-bold text-foreground">
                              {formatCurrency(asg.agreed_fee, asg.currency || project.currency)}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={paymentStatusBadge[asg.payment_status] || "neutral"}
                                className="text-[10px] capitalize font-semibold"
                              >
                                {asg.payment_status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="iconSm"
                                onClick={() => handleRemoveAssignment(asg.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                title="Remove assignment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                          No team members assigned to this project yet. Click &quot;Assign Member&quot; to allocate developers or designers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Hosting & Domain */}
        <TabsContent value="hosting">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Domain & Hosting Assets</CardTitle>
                <CardDescription className="text-xs">
                  Registrars, DNS settings, server plans, and expiration countdowns.
                </CardDescription>
              </div>
              <Link href="/domains-hosting">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <span>Manage In Phase 4</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="h-28 flex flex-col items-center justify-center border-dashed border-2 rounded-lg text-center p-4">
                <Globe className="h-6 w-6 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">Technical Asset Engine Gated for Phase 4</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Registrars, SSL renewal alerts, and server infrastructure references will link here in Phase 4.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Invoices */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Project Invoices</CardTitle>
                <CardDescription className="text-xs">
                  Billed milestones against total contract value ({formatCurrency(project.contract_amount, project.currency)}).
                </CardDescription>
              </div>
              <Link href={`/invoices/new?clientId=${project.client_id}&projectId=${project.id}`}>
                <Button size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Issue Milestone Invoice</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-muted/20 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Milestone Invoicing Engine</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Bill deliverables with automated tax calculations, due dates, and sequential numbering.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs h-8">
                    <Link href={`/invoices`}>View Invoices</Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs h-8">
                    <Link href={`/invoices/new?clientId=${project.client_id}&projectId=${project.id}`}>
                      Issue Invoice
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Payments */}
        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Verified Client Payments</CardTitle>
                <CardDescription className="text-xs">
                  Realized bank inflows received directly for this project contract.
                </CardDescription>
              </div>
              <Link href="/invoices/payments">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Payments Ledger</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-emerald-500/10 border-emerald-500/20 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Cash Inflow Reconciliation
                    </h4>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                      Payments are matched against invoices to prevent double-counting.
                    </p>
                  </div>
                </div>
                <Button size="sm" asChild className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link href="/invoices/payments">View Cash Receipts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Expenses */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Direct Project Expenses</CardTitle>
                <CardDescription className="text-xs">
                  Software plugins, premium templates, stock assets, and third-party APIs.
                </CardDescription>
              </div>
              <Link href="/finances/expenses">
                <Button size="sm" className="h-8 gap-1.5 text-xs">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Record Expense</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-rose-500/5 border-rose-500/20 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                      Project-Attributed Liabilities
                    </h4>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                      Track licensed stock footage, dedicated servers, and APIs tied to this project.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs h-8">
                    <Link href="/finances">Cash Flow Overview</Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white">
                    <Link href="/finances/expenses">View All Expenses</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Files */}
        <TabsContent value="files">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Project Documents & Assets</CardTitle>
              <CardDescription className="text-xs">
                Contracts, brand guidelines, and client-supplied media.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-28 flex flex-col items-center justify-center border-dashed border-2 rounded-lg text-center p-4">
                <FolderArchive className="h-6 w-6 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">Secure Storage Integration</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supabase Storage bucket upload and preview integration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 9: Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Audit Stream & Activity Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable chronological event trail of project status transitions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 py-1.5 border-b text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Project created and contract registered ({formatDate(project.created_at)})</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Team member assignments registered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Modal Dialog */}
      <AssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        projectId={project.id}
        teamMembers={teamMembers}
        onSuccess={handleAssignmentCreated}
      />
    </div>
  )
}
