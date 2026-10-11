"use client"

import * as React from "react"
import Link from "next/link"
import {
  Briefcase,
  Receipt,
  FileText,
  Building,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Client } from "@/types/client.types"

interface ClientDetailTabsProps {
  client: Client
}

export function ClientDetailTabs({ client }: ClientDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-muted/60 p-1">
        <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
          <Building className="h-3.5 w-3.5" />
          <span>Profile Overview</span>
        </TabsTrigger>
        <TabsTrigger value="projects" className="text-xs sm:text-sm gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          <span>Associated Projects ({client.project_count || 0})</span>
        </TabsTrigger>
        <TabsTrigger value="invoices" className="text-xs sm:text-sm gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          <span>Invoices & Payments</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs sm:text-sm gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>Internal Notes</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Overview */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company & Legal Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Entity & Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Client Unique Code</span>
                <span className="font-mono font-bold text-foreground">{client.client_code}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Legal Company Name</span>
                <span className="font-semibold text-foreground">{client.company_name || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Tax / VAT Identifier</span>
                <span className="font-mono text-foreground">{client.tax_number || "Not Registered"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Default Currency</span>
                <span className="font-mono font-bold text-foreground">{client.currency}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Client Since</span>
                <span className="text-foreground">{formatDate(client.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Direct Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Key Contact Person</span>
                <span className="font-semibold text-foreground">{client.contact_person || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Email Address</span>
                <Link href={`mailto:${client.email}`} className="text-primary hover:underline font-medium">
                  {client.email}
                </Link>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-mono text-foreground">{client.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">WhatsApp Channel</span>
                <span className="font-mono text-foreground">{client.whatsapp || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Billing Address</span>
                <span className="text-right text-foreground max-w-[200px]">
                  {client.address ? `${client.address}, ${client.city || ""}, ${client.country}` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Tab 2: Projects */}
      <TabsContent value="projects">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Client Projects</CardTitle>
              <CardDescription className="text-xs">
                Active web development contracts and digital deliverables.
              </CardDescription>
            </div>
            <Link href="/projects/new">
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Project</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {client.project_count && client.project_count > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">Corporate Web Redesign</span>
                    <span className="text-muted-foreground text-[11px]">Next.js • Tailwind CSS • Supabase</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="text-[10px]">In Progress</Badge>
                    <span className="font-bold text-foreground">{formatCurrency(450000, client.currency)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-lg text-center p-4">
                <Briefcase className="h-6 w-6 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">No Projects Created Yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Start a new web design, e-commerce, or custom development project for this client.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 3: Invoices */}
      <TabsContent value="invoices">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Billing & Invoices</CardTitle>
              <CardDescription className="text-xs">
                Historical invoices, payment records, and outstanding receivables.
              </CardDescription>
            </div>
            <Link href={`/invoices/new?clientId=${client.id}`}>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Issue Invoice</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Lifetime Billed</span>
                <p className="text-lg font-black text-foreground mt-0.5">
                  {formatCurrency(client.lifetime_invoiced || 0, client.currency)}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Outstanding Due</span>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatCurrency(client.outstanding_balance || 0, client.currency)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-muted/20 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Active Invoicing Available</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Issue invoices with VAT, partial payment tracking, and printable vector PDFs.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="text-xs h-8">
                  <Link href={`/invoices`}>View Invoices</Link>
                </Button>
                <Button size="sm" asChild className="text-xs h-8">
                  <Link href={`/invoices/new?clientId=${client.id}`}>Issue New Invoice</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 4: Notes */}
      <TabsContent value="notes">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Internal Account Notes</CardTitle>
            <CardDescription className="text-xs">
              Private agency notes regarding communication, preferences, and special SLAs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/40 border text-xs text-foreground leading-relaxed">
              {client.notes ? (
                <p className="whitespace-pre-wrap">{client.notes}</p>
              ) : (
                <p className="text-muted-foreground italic">No internal notes added for this client yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
