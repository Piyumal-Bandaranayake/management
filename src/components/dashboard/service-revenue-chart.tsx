"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import type { ServiceCategoryRevenue } from "@/types/analytics.types"

interface ServiceRevenueChartProps {
  data: ServiceCategoryRevenue[]
}

export function ServiceRevenueChart({ data }: ServiceRevenueChartProps) {
  return (
    <Card className="border border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Revenue by Offering Line
        </CardTitle>
        <CardDescription className="text-xs">
          Contribution of digital services to gross agency collections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {data.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(item.revenue, "LKR")}
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
