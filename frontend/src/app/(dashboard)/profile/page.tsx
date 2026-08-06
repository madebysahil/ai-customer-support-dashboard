"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Info, Lock } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : (user?.role === 'ADMINISTRATOR' ? 'AD' : 'JD')

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full mx-auto pb-10">
      <div className="flex items-end justify-between border-b pb-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{user?.fullName || 'John Doe'}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                {user?.role || 'Administrator'}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Active Account
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Review your profile details. Editing requires backend support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Full Name</label>
                <Input defaultValue={user?.fullName || 'John Doe'} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-2">
                  Email Address
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </label>
                <Input defaultValue={user?.email || 'admin@supportpilot.com'} type="email" readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4 flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p>
                <strong>Read Only:</strong> Profile editing is currently disabled as it requires backend API support to process user updates. 
                Your information is safely stored and managed by your organization&apos;s identity provider.
              </p>
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <Button disabled variant="secondary">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>System information regarding your user record.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">October 24, 2023</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Last Login</p>
                <p className="font-medium">Just now</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Account ID</p>
                <p className="font-medium font-mono text-xs">{user?.id || 'usr_29dn391kd'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
