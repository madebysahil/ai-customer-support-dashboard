"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Full Name</label>
              <Input defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <Input defaultValue="admin@example.com" type="email" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>Manage generative AI thresholds and behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Confidence Threshold (%)</label>
              <Input defaultValue="85" type="number" />
              <p className="text-xs text-muted-foreground">If AI confidence is below this threshold, it will escalate to a human agent.</p>
            </div>
            <Button variant="secondary">Update Threshold</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
