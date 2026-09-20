"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useCustomer } from "@/hooks/useCustomers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Edit, Mail, Phone, Building2, Loader2 } from "lucide-react"

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const { data: customer, isLoading, isError } = useCustomer(id as string)

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-foreground-muted" /></div>
  }

  if (isError || !customer) {
    return <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-bold text-foreground">Customer not found</h2>
      <Button asChild><Link href="/customers">Back to Customers</Link></Button>
    </div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-foreground-muted hover:text-foreground">
          <Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Customer Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-surface border border-border-subtle rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center text-center p-6 bg-background-subtle border-b border-border-subtle">
            <Avatar className="h-20 w-20 mb-4 rounded-md border border-border-subtle bg-surface">
              <AvatarFallback className="text-xl bg-transparent text-foreground-muted rounded-md">{customer.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-foreground">{customer.displayName}</h2>
            <p className="text-xs text-foreground-muted mt-1">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground">{customer.email}</span>
            </div>
            {customer.phoneNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground">{customer.phoneNumber}</span>
              </div>
            )}
            {customer.companyName && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground">{customer.companyName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
             <div className="bg-surface border border-border-subtle rounded-md p-4 flex flex-col gap-1">
               <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">CSAT Average</span>
               <div className="text-2xl font-bold text-foreground mt-1">{customer.csatAverage ? `${customer.csatAverage} / 5` : "N/A"}</div>
             </div>
             <div className="bg-surface border border-border-subtle rounded-md p-4 flex flex-col gap-1">
               <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Value</span>
               <div className="text-2xl font-bold text-foreground mt-1">N/A</div>
             </div>
          </div>
          
          <div className="flex-1 bg-surface border border-border-subtle rounded-md overflow-hidden min-h-[300px]">
            <div className="px-4 py-3 border-b border-border-subtle bg-background-subtle">
              <h3 className="font-semibold text-sm text-foreground">Recent Tickets</h3>
            </div>
            <div className="p-8 text-center flex flex-col items-center justify-center text-foreground-muted h-full min-h-[200px]">
              <p className="text-sm">Ticket history is not available right now.</p>
              <Button asChild variant="outline" className="mt-4 border-border-subtle">
                 <Link href="/tickets">Go to Inbox</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
