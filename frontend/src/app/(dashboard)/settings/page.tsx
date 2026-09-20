"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Shield, Bell, Palette, Sparkles, Building, Settings as SettingsIcon, Loader2, Save } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({})

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      const data = (await res.json()).data || {};
      setLocalSettings(data);
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      await api.patch(`/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  const handleSave = (key: string, value: any) => {
    updateMutation.mutate({ key, value })
  }

  const handleLocalChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-foreground-muted" /></div>;
  }

  const isAdmin = user?.role === 'ADMINISTRATOR'

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] w-full mx-auto p-4 md:p-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-col h-auto w-full md:w-56 bg-transparent p-0 space-y-1 shrink-0">
            <TabsTrigger value="general" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><SettingsIcon className="mr-2 h-4 w-4" />General</TabsTrigger>
            <TabsTrigger value="appearance" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="ai" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><Sparkles className="mr-2 h-4 w-4" />AI Preferences</TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="workspace" className="w-full justify-start px-3 py-2 text-sm text-left font-normal data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground text-foreground-muted hover:text-foreground rounded-md transition-colors"><Building className="mr-2 h-4 w-4" />Workspace</TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full max-w-3xl">
            <TabsContent value="general" className="mt-0">
              <div className="flex flex-col gap-6">
                <div><h2 className="text-lg font-semibold text-foreground">Platform Configuration</h2></div>
                <div className="bg-surface border border-border-subtle rounded-md p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Default Timezone</label>
                    <div className="flex gap-2">
                      <Input 
                        value={localSettings['general.timezone'] || "UTC (Coordinated Universal Time)"} 
                        onChange={(e) => handleLocalChange('general.timezone', e.target.value)}
                        readOnly={!isAdmin}
                        className="max-w-md" 
                      />
                      {isAdmin && <Button variant="outline" size="icon" onClick={() => handleSave('general.timezone', localSettings['general.timezone'])} disabled={updateMutation.isPending}><Save className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Language</label>
                    <div className="flex gap-2">
                      <Input 
                        value={localSettings['general.language'] || "English (US)"} 
                        onChange={(e) => handleLocalChange('general.language', e.target.value)}
                        readOnly={!isAdmin}
                        className="max-w-md" 
                      />
                      {isAdmin && <Button variant="outline" size="icon" onClick={() => handleSave('general.language', localSettings['general.language'])} disabled={updateMutation.isPending}><Save className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <div className="bg-surface border border-border-subtle rounded-md p-6">
                <div className="rounded-md bg-background-subtle border border-border-subtle p-4 flex items-start gap-3 text-sm text-foreground-muted">
                  <Palette className="h-5 w-5 text-primary shrink-0" />
                  <p>Theme toggling is available in the top-right user menu. More advanced options are <strong>Coming Soon</strong>.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="mt-0">
              <div className="flex flex-col gap-6">
                <div><h2 className="text-lg font-semibold text-foreground">AI Preferences</h2></div>
                <div className="bg-surface border border-border-subtle rounded-md p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confidence Threshold (%)</label>
                    <div className="flex gap-2">
                      <Input 
                        value={localSettings['ai.confidence_threshold'] || "85"} 
                        type="number" 
                        onChange={(e) => handleLocalChange('ai.confidence_threshold', parseFloat(e.target.value))}
                        readOnly={!isAdmin}
                        className="max-w-xs" 
                      />
                      {isAdmin && <Button variant="outline" size="icon" onClick={() => handleSave('ai.confidence_threshold', localSettings['ai.confidence_threshold'])} disabled={updateMutation.isPending}><Save className="h-4 w-4" /></Button>}
                    </div>
                    <p className="text-xs text-foreground-subtle">If AI confidence is below this threshold, it will escalate to a human agent.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
               <div className="bg-surface border border-border-subtle rounded-md p-12 flex flex-col items-center justify-center text-center">
                  <Bell className="h-5 w-5 text-foreground-subtle mb-4" />
                  <h3 className="text-sm font-semibold text-foreground">Coming Soon</h3>
               </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
               <div className="bg-surface border border-border-subtle rounded-md p-12 flex flex-col items-center justify-center text-center">
                  <Shield className="h-5 w-5 text-foreground-subtle mb-4" />
                  <h3 className="text-sm font-semibold text-foreground">Coming Soon</h3>
               </div>
            </TabsContent>
            
            <TabsContent value="workspace" className="mt-0">
               <div className="bg-surface border border-border-subtle rounded-md p-12 flex flex-col items-center justify-center text-center">
                  <Building className="h-5 w-5 text-foreground-subtle mb-4" />
                  <h3 className="text-sm font-semibold text-foreground">Coming Soon</h3>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
