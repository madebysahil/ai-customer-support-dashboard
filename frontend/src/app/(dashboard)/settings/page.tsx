"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Bell, Palette, Sparkles, Building, Settings as SettingsIcon, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full md:w-64 flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
            <TabsTrigger 
              value="general" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="workspace" 
              className="w-full justify-start px-4 py-2.5 h-auto text-left font-normal data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:shadow-none rounded-md"
            >
              <Building className="mr-2 h-4 w-4" />
              Workspace
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full">
            <TabsContent value="general" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>System-wide settings for your customer support environment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Default Timezone</label>
                    <Input defaultValue="UTC (Coordinated Universal Time)" readOnly className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Language</label>
                    <Input defaultValue="English (US)" readOnly className="bg-muted/50 cursor-not-allowed" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-4 flex items-start gap-3 text-sm text-muted-foreground">
                    <Palette className="h-5 w-5 text-primary shrink-0" />
                    <p>
                      Theme toggling is available in the top-right user menu. More advanced customization options are <strong>Coming Soon</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive alerts and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Granular notification preferences require the upcoming Notification Service API integration.
                    </p>
                    <Badge variant="outline" className="mt-4">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Preferences</CardTitle>
                  <CardDescription>Configure behavior for the AI Copilot and auto-responders.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Confidence Threshold (%)</label>
                    <Input defaultValue="85" type="number" readOnly className="bg-muted/50 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">If AI confidence is below this threshold, it will escalate to a human agent.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password, 2FA, and active sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Enhanced Security</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Two-factor authentication and session management require the Identity Provider API upgrade.
                    </p>
                    <Badge variant="outline" className="mt-4">Awaiting Backend Support</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workspace" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace</CardTitle>
                  <CardDescription>Manage team members and organization settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Team Management</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Workspace administration and role-based access control requires the Multi-tenant API upgrade.
                    </p>
                    <Badge variant="outline" className="mt-4">Awaiting Backend Support</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
