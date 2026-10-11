"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectStatusDistribution } from "@/types/analytics.types"

interface ProjectDistributionChartProps {
  data: ProjectStatusDistribution[]
}

export function ProjectDistributionChart({ data }: ProjectDistributionChartProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
      return (
        <div className="rounded-lg border bg-popover/95 p-2.5 shadow-lg text-xs space-y-1 backdrop-blur-xs">
          <div className="font-bold flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
          <div className="text-muted-foreground font-mono">
            {item.count} projects ({pct}%)
          </div>
        </div>
      )
    }
    return null
  }

  if (!mounted) {
    return (
      <Card className="border border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Active Projects Lifecycle</CardTitle>
          <CardDescription className="text-xs">Loading status breakdown...</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
          Loading visualization...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-bold text-foreground">
          Active Projects Lifecycle
        </CardTitle>
        <CardDescription className="text-xs">
          Distribution across planning, development, and review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black font-mono text-foreground">{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Projects
            </span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
          {data.map((entry) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
            return (
              <div key={entry.status} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate text-[11px]">{entry.label}</span>
                </span>
                <span className="font-mono font-bold text-[11px] text-foreground">
                  {entry.count} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
