import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getClientsAction } from "@/actions/clients.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/projects/project-form"

export const metadata = {
  title: "New Project — AgencyFlow",
  description: "Create and configure a new client project contract",
}

export default async function NewProjectPage() {
  const { clients = [] } = await getClientsAction()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects Hub</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Register New Project</CardTitle>
          <CardDescription className="text-xs">
            Link project to a client, establish agreed contract values, and set expected milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm clients={clients} />
        </CardContent>
      </Card>
    </div>
  )
}
