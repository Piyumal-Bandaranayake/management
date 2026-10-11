import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientForm } from "@/components/clients/client-form"

export const metadata = {
  title: "New Client — AgencyFlow",
  description: "Register a new client company or individual partner",
}

export default function NewClientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Register New Client</CardTitle>
          <CardDescription className="text-xs">
            Provide the company or brand profile, billing currency, contact person, and billing details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  )
}
