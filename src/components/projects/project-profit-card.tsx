import { DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ProjectProfitCardProps {
  contractAmount: number
  totalAgreedFees: number
  estimatedCosts: number
  currency: string
}

export function ProjectProfitCard({
  contractAmount,
  totalAgreedFees,
  estimatedCosts,
  currency = "LKR",
}: ProjectProfitCardProps) {
  const totalOutflows = totalAgreedFees + estimatedCosts
  const estimatedProfit = contractAmount - totalOutflows
  const marginPercentage =
    contractAmount > 0 ? Math.round((estimatedProfit / contractAmount) * 1000) / 10 : 0

  const isHealthyMargin = marginPercentage >= 50

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Project Financial Profitability
            </CardTitle>
            <CardDescription className="text-xs">
              Live margin projection based on contracted client value and team obligations.
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Margin</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {marginPercentage}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-card border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Contract Value
            </span>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {formatCurrency(contractAmount, currency)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-card border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Agreed Team Fees
            </span>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {formatCurrency(totalAgreedFees, currency)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-card border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Direct Costs
            </span>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {formatCurrency(estimatedCosts, currency)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
              Estimated Net Profit
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(estimatedProfit, currency)}
            </p>
          </div>
        </div>

        {/* Progress Visual Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Expenses + Contractor Commitments ({100 - marginPercentage}%)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Retained Agency Margin ({marginPercentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
            <div
              className="bg-primary/50 transition-all duration-300"
              style={{ width: `${Math.max(0, 100 - marginPercentage)}%` }}
              title="Committed Costs"
            />
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, marginPercentage)}%` }}
              title="Net Profit Margin"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
