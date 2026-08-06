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
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (isError || !customer) {
    return <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-bold">Customer not found</h2>
      <Button asChild><Link href="/customers">Back to Customers</Link></Button>
    </div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customers"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center pb-2">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl">{customer.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{customer.displayName}</CardTitle>
            <CardDescription className="mt-2">Joined {new Date(customer.createdAt).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            {customer.phoneNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phoneNumber}</span>
              </div>
            )}
            {customer.companyName && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{customer.companyName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity & Stats Placeholder */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">CSAT Average</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{customer.csatAverage ? `${customer.csatAverage} / 5` : "N/A"}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">0</div>
               </CardContent>
             </Card>
          </div>
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity found for this customer.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
