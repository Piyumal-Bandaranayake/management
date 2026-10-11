import * as React from "react"
import { getRenewalsAction } from "@/actions/domains-hosting.actions"
import { RenewalsCommandCenter } from "@/components/renewals/renewals-command-center"

export const metadata = {
  title: "Renewal Command Center — AgencyFlow",
  description: "Centralized domain, hosting, and SLA renewal notifications with 7, 14, and 30-day tiers",
}

export default async function RenewalsPage() {
  const {
    allRenewals = [],
    totalUpcomingCost = 0,
    agencyBilledCost = 0,
  } = await getRenewalsAction()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Technical Renewals Command Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated 7, 14, and 30-day expiration alerts, billing ownership tracking, and cost recovery.
        </p>
      </div>

      <RenewalsCommandCenter
        renewals={allRenewals}
        totalUpcomingCost={totalUpcomingCost}
        agencyBilledCost={agencyBilledCost}
      />
    </div>
  )
}
