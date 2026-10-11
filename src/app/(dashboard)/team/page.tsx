import {
  getTeamMembersAction,
  getTeamStatSummaryAction,
} from "@/actions/team.actions"
import { TeamTableWrapper } from "@/components/team/team-table-wrapper"

export const metadata = {
  title: "Team & Payroll | AgencyFlow",
  description: "Manage in-house engineers, contractors, freelancers, and milestone payouts.",
}

export default async function TeamPage() {
  const [membersRes, statsRes] = await Promise.all([
    getTeamMembersAction(),
    getTeamStatSummaryAction(),
  ])

  const members = membersRes.success ? membersRes.teamMembers || [] : []
  const summary = statsRes.summary

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members & Contractors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Directory of developers, designers, agreed rates, and contractor milestone payouts
          </p>
        </div>
      </div>

      <TeamTableWrapper initialMembers={members} summary={summary} />
    </div>
  )
}
