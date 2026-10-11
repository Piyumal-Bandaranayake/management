"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  isCurrency?: boolean
  currency?: string
  accentColor?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  isCurrency = false,
  currency = "LKR",
  accentColor = "text-primary",
}: StatCardProps) {
  const displayValue =
    isCurrency && typeof value === "number"
      ? formatCurrency(value, currency)
      : value

  return (
    <Card className="border border-border/70 bg-card hover:border-border transition-all duration-200 shadow-xs">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className={`p-1.5 rounded-lg bg-muted/60 ${accentColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-mono">
            {displayValue}
          </span>
          {badge && (
            <Badge variant={badge.variant || "outline"} className="text-[9px] font-mono py-0 px-1.5">
              {badge.text}
            </Badge>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-border/40 text-muted-foreground">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {trend && (
              <span
                className={`font-semibold text-[10px] font-mono shrink-0 ${
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
