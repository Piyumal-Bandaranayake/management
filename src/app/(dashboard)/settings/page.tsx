import * as React from "react"
import type { Metadata } from "next"
import { getAgencySettingsAction } from "@/actions/settings.actions"
import { AgencySettingsForm } from "@/components/settings/agency-settings-form"

export const metadata: Metadata = {
  title: "Agency Settings | AgencyFlow",
  description: "Configure agency profile, tax registration, base currency, and document prefix rules.",
}

export default async function SettingsPage() {
  const { settings } = await getAgencySettingsAction()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Agency System Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your enterprise agency profile, base currency defaults, billing snapshots, and document prefixes.
        </p>
      </div>

      <AgencySettingsForm settings={settings} />
    </div>
  )
}
