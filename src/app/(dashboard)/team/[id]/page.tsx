import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamMemberByIdAction } from "@/actions/team.actions"
import { TeamMemberDetailTabs } from "@/components/team/team-member-detail-tabs"

export const metadata = {
  title: "Team Member Details | AgencyFlow",
  description: "View contractor profile, assignment history, and payout ledger.",
}

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getTeamMemberByIdAction(id)

  if (!res.success || !res.teamMember) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href="/team">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Team Member Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Staff compensation details, bank wire information, and project deliverables
          </p>
        </div>
      </div>

      <TeamMemberDetailTabs member={res.teamMember} />
    </div>
  )
}
