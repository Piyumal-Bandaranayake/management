"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  CreditCard,
  UserCheck,
  Briefcase,
} from "lucide-react"
import type { TeamMember } from "@/types/team.types"
import { TeamPayoutDialog } from "./team-payout-dialog"

interface TeamTableProps {
  teamMembers: TeamMember[]
  onRefresh?: () => void
}

export function TeamTable({ teamMembers, onRefresh }: TeamTableProps) {
  const [payoutTarget, setPayoutTarget] = useState<TeamMember | null>(null)

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Team Member",
        cell: ({ row }) => {
          const m = row.original
          const initials = m.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()

          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 text-xs font-bold border border-border">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/team/${m.id}`}
                  className="font-bold text-xs hover:underline text-primary"
                >
                  {m.full_name}
                </Link>
                <div className="text-[11px] text-muted-foreground">{m.email}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "designation",
        header: "Role & Skills",
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="max-w-[220px]">
              <div className="font-semibold text-xs text-foreground truncate">
                {m.designation}
              </div>
              {m.skills && m.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.skills.slice(0, 2).map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                  {m.skills.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{m.skills.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "employment_type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.employment_type
          const typeMap: Record<string, { label: string; className: string }> = {
            full_time: {
              label: "Full-Time",
              className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300",
            },
            contractor: {
              label: "Contractor",
              className: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300",
            },
            freelancer: {
              label: "Freelancer",
              className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300",
            },
            part_time: {
              label: "Part-Time",
              className: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300",
            },
          }
          const conf = typeMap[type] || typeMap.contractor

          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold px-2 py-0.5 capitalize border ${conf.className}`}
            >
              {conf.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "default_rate",
        header: "Benchmark Rate",
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="text-xs font-medium">
              {m.currency} {Number(m.default_rate || 0).toLocaleString()}
            </div>
          )
        },
      },
      {
        accessorKey: "active_assignments_count",
        header: "Assignments",
        cell: ({ row }) => {
          const count = row.original.active_assignments_count || 0
          return (
            <Badge variant="secondary" className="text-xs font-semibold">
              <Briefcase className="h-3 w-3 mr-1" />
              {count} {count === 1 ? "Project" : "Projects"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "total_paid",
        header: () => <div className="text-right">Paid / Pending</div>,
        cell: ({ row }) => {
          const m = row.original
          const paid = Number(m.total_paid || 0)
          const pending = Number(m.pending_payout || 0)

          return (
            <div className="text-right text-xs">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                Paid: LKR {paid.toLocaleString()}
              </div>
              <div className={`text-[11px] ${pending > 0 ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>
                Pending: LKR {pending.toLocaleString()}
              </div>
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const m = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuLabel>Member Controls</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/team/${m.id}`} className="cursor-pointer gap-2">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPayoutTarget(m)}
                  className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Disburse Payout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: teamMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <>
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3.5 first:pl-4 last:pr-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3.5 first:pl-4 last:pr-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-muted-foreground text-xs">
                    No team members found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{teamMembers.length}</span> members
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 text-xs px-2.5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 text-xs px-2.5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {payoutTarget && (
        <TeamPayoutDialog
          open={!!payoutTarget}
          onOpenChange={(open) => !open && setPayoutTarget(null)}
          teamMembers={teamMembers}
          initialMemberId={payoutTarget.id}
          onSuccess={() => {
            setPayoutTarget(null)
            onRefresh?.()
          }}
        />
      )}
    </>
  )
}
