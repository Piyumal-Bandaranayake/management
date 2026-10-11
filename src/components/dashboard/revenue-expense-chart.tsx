"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { MonthlyFinancialPoint } from "@/types/analytics.types"

interface RevenueExpenseChartProps {
  data: MonthlyFinancialPoint[]
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="border border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Monthly Cash Flow & Profit Trend</CardTitle>
          <CardDescription className="text-xs">Loading chart analytics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] flex items-center justify-center text-muted-foreground text-xs">
          Loading visualization...
        </CardContent>
      </Card>
    )
  }

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${Math.round(val / 1000)}k`
    return `${val}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover/95 p-3 shadow-lg text-xs space-y-1.5 backdrop-blur-xs">
          <div className="font-bold text-foreground border-b pb-1 mb-1">{label}</div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(entry.value, "LKR")}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Monthly Cash Flow & Profitability
          </CardTitle>
          <CardDescription className="text-xs">
            Realized cash collections vs. business expenses & contractor payouts (LKR)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="inflow"
                name="Cash Inflow"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="outflow"
                name="Cash Outflow"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366f1" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
