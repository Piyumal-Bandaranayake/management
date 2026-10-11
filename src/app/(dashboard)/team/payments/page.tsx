import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import {
  getTeamPayoutsAction,
  getTeamMembersAction,
} from "@/actions/team.actions"
import { TeamPayoutTableWrapper } from "@/components/team/team-payout-table-wrapper"

export const metadata = {
  title: "Team Payouts | AgencyFlow",
  description: "Track realized contractor payments, milestone disbursements, and payroll.",
}

export default async function TeamPaymentsPage() {
  const [paymentsRes, membersRes] = await Promise.all([
    getTeamPayoutsAction(),
    getTeamMembersAction(),
  ])

  const payments = paymentsRes.success ? paymentsRes.payments || [] : []
  const members = membersRes.success ? membersRes.teamMembers || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contractor Payouts Ledger</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Verified payouts disbursed to developers, designers, and freelancers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
            <Link href="/team">
              <Users className="h-3.5 w-3.5" />
              Team Directory
            </Link>
          </Button>
        </div>
      </div>

      <TeamPayoutTableWrapper
        initialPayments={payments}
        teamMembers={members}
      />
    </div>
  )
}
