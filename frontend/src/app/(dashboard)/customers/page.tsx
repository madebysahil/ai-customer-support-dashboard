"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MoreHorizontal, Loader2 } from "lucide-react"
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  
  const { data, isLoading, isError } = useCustomers({ page, limit: 10, search })
  const deleteMutation = useDeleteCustomer()

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-foreground-muted">Manage and view your active customers.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
            <Input 
              placeholder="Search customers..." 
              className="pl-8 bg-surface border-border-subtle" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button variant="outline" className="border-border-subtle bg-surface text-foreground hover:bg-background shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="border border-border-subtle rounded-md bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-background-subtle">
            <TableRow className="hover:bg-transparent border-border-subtle">
              <TableHead className="text-foreground-muted">Customer</TableHead>
              <TableHead className="text-foreground-muted">Company</TableHead>
              <TableHead className="text-foreground-muted">Joined</TableHead>
              <TableHead className="text-right text-foreground-muted">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-foreground-subtle" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-critical">
                  Error loading customers.
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-foreground-muted text-sm">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((customer) => (
                <TableRow key={customer.id} className="border-border-subtle hover:bg-background-subtle/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-md border border-border-subtle">
                        <AvatarFallback className="bg-background-subtle text-foreground-muted text-xs rounded-md">
                          {customer.displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{customer.displayName}</span>
                        <span className="text-[11px] text-foreground-muted">{customer.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground-muted">{customer.companyName || "-"}</TableCell>
                  <TableCell className="text-sm text-foreground-muted">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-foreground-muted hover:text-foreground">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel className="text-xs text-foreground-muted font-semibold uppercase tracking-wider">Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${customer.id}`} className="text-sm cursor-pointer">View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm cursor-pointer">Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-critical focus:text-critical focus:bg-critical/10 text-sm cursor-pointer"
                          onClick={() => handleDelete(customer.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-background-subtle/50">
            <span className="text-xs text-foreground-muted">
              Showing <span className="font-medium text-foreground">{data.data.length}</span> of <span className="font-medium text-foreground">{data.meta.total}</span> customers
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.meta.hasPrevPage}
                className="h-8 border-border-subtle"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!data.meta.hasNextPage}
                className="h-8 border-border-subtle"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
