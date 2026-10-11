"use client"

import * as React from "react"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClientStatHeader } from "@/components/clients/client-stat-header"
import { ClientTable } from "@/components/clients/client-table"
import { ClientForm } from "@/components/clients/client-form"
import type { Client } from "@/types/client.types"

interface ClientTableClientWrapperProps {
  initialClients: Client[]
}

export function ClientTableClientWrapper({ initialClients }: ClientTableClientWrapperProps) {
  const [clients, setClients] = React.useState<Client[]>(initialClients)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)

  const handleCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev])
    setCreateDialogOpen(false)
  }

  const handleUpdated = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    )
    setEditingClient(null)
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Add Client Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Client Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage partner relationships, invoicing contacts, and associated project portfolios.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </Button>
      </div>

      {/* KPI Cards Header */}
      <ClientStatHeader clients={clients} />

      {/* Client Table */}
      <ClientTable
        initialClients={clients}
        onEditClient={(client) => setEditingClient(client)}
      />

      {/* Create Client Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client Profile</DialogTitle>
            <DialogDescription>
              Create a client account to link projects, domains, and issue invoices.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSuccess={handleCreated}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client — {editingClient?.name}</DialogTitle>
            <DialogDescription>
              Update business details, billing currency, or contact information.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <ClientForm
              initialData={editingClient}
              onSuccess={handleUpdated}
              onCancel={() => setEditingClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
