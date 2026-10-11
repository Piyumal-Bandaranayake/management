"use client"

import * as React from "react"
import { CheckCircle2, Clock, AlertTriangle, Layers, PlayCircle, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TaskStatSummary } from "@/types/task.types"

interface TaskStatHeaderProps {
  summary: TaskStatSummary
}

export function TaskStatHeader({ summary }: TaskStatHeaderProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Tasks */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Deliverables</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground">{summary.total_tasks}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{summary.completion_rate}% Done</span>
          </div>
        </CardContent>
      </Card>

      {/* Backlog */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Backlog</span>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground">{summary.backlog_count}</span>
            <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono text-slate-600">Queued</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Todo */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">To Do</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground">{summary.todo_count}</span>
            <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono text-blue-600">Sprint Ready</Badge>
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{summary.in_progress_count}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Active Code</span>
          </div>
        </CardContent>
      </Card>

      {/* In Review */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Review</span>
            <Eye className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{summary.in_review_count}</span>
            <span className="text-[10px] text-muted-foreground font-medium">QA & Testing</span>
          </div>
        </CardContent>
      </Card>

      {/* Completed & Overdue */}
      <Card className={`border shadow-xs ${summary.overdue_count > 0 ? "border-rose-300/80 bg-rose-50/30 dark:bg-rose-950/20" : "border-border/60"}`}>
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            {summary.overdue_count > 0 ? (
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{summary.done_count}</span>
            {summary.overdue_count > 0 ? (
              <Badge variant="destructive" className="text-[9px] py-0 px-1 font-mono">
                {summary.overdue_count} Overdue
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono text-emerald-600">
                100% On-Track
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
