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
               <div className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                 {customer.csatAverage ? (
                   <>
                     {Number(customer.csatAverage).toFixed(1)} <span className="text-sm text-foreground-muted">/ 5.0</span>
                     <div className="flex items-center ml-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <svg key={star} className={`w-4 h-4 ${star <= Math.round(Number(customer.csatAverage)) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                       ))}
                     </div>
                   </>
                 ) : "N/A"}
               </div>
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
            <div className="flex flex-col h-full min-h-[200px] bg-background">
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="relative pl-6 border-l border-border-subtle space-y-6 mt-2 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
                    <p className="text-sm font-medium text-foreground">Customer Profile Created</p>
                    <p className="text-xs text-foreground-muted mt-0.5">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background" />
                    <p className="text-sm font-medium text-foreground">Email verified</p>
                    <p className="text-xs text-foreground-muted mt-0.5">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border-subtle bg-background-subtle flex justify-center">
                 <Button asChild variant="outline" size="sm" className="border-border-subtle">
                   <Link href="/tickets">View Full History</Link>
                 </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
