"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.json();
    }
  });

  const profile = profileData?.data || user;

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : (profile?.role === 'ADMINISTRATOR' ? 'AD' : 'JD')

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-foreground-muted" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] w-full mx-auto p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center gap-6 border-b border-border-subtle pb-6">
        <Avatar className="h-20 w-20 border border-border-subtle shadow-sm bg-surface">
          <AvatarImage src={profile?.avatarUrl || "https://github.com/shadcn.png"} alt={profile?.fullName || "User"} />
          <AvatarFallback className="text-xl bg-background-subtle text-foreground-muted">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">{profile?.fullName || 'John Doe'}</h1>
          <div className="flex items-center gap-3 text-foreground-muted text-[13px]">
            <span className="uppercase tracking-wider font-semibold bg-background-subtle border border-border-subtle px-2 py-0.5 rounded-sm">
              {profile?.role || 'Administrator'}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-success"></span>
              Active Account
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-surface border border-border-subtle rounded-md overflow-hidden">
          <div className="p-4 border-b border-border-subtle bg-background-subtle">
            <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-medium text-foreground">{profile?.fullName || 'John Doe'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-medium text-foreground">{profile?.email || 'admin@supportpilot.com'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-md overflow-hidden">
          <div className="p-4 border-b border-border-subtle bg-background-subtle">
            <h2 className="text-sm font-semibold text-foreground">Account Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'October 24, 2023'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Last Login</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Just now'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Account ID</p>
                <p className="font-mono text-xs font-medium text-foreground">{profile?.id || 'usr_29dn391kd'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
