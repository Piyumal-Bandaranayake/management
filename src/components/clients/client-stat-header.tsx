import { Users, UserCheck, UserPlus, DollarSign, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "@/types/client.types"

interface ClientStatHeaderProps {
  clients: Client[]
}

export function ClientStatHeader({ clients }: ClientStatHeaderProps) {
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const leadsCount = clients.filter((c) => c.status === "lead").length
  const totalLifetimeInvoiced = clients.reduce((acc, c) => acc + (c.lifetime_invoiced || 0), 0)
  const totalOutstanding = clients.reduce((acc, c) => acc + (c.outstanding_balance || 0), 0)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Accounts */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Client Accounts
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight">{totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered agency partners
          </p>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Accounts
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight">{activeClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {leadsCount} prospect leads in pipeline
          </p>
        </CardContent>
      </Card>

      {/* Lifetime Invoiced Value */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lifetime Billed
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight">
            {formatCurrency(totalLifetimeInvoiced)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across active project contracts
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Receivables */}
      <Card className="hover:shadow-sm transition-shadow border-amber-500/20 bg-amber-500/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Total Outstanding
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pending client invoice balances
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
