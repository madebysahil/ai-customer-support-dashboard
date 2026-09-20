"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setErrorMsg("")
    try {
      await login(data)
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1.5 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="rounded-md border border-critical/20 bg-critical/10 p-3 text-sm text-critical font-medium text-center">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">Email</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-critical">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-foreground">Password</label>
              <a href="#" className="text-xs text-foreground-muted hover:text-foreground transition-colors">Forgot password?</a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-critical">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-2">
          <Button className="w-full h-10" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          
          <div className="relative w-full my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-wider">
              <span className="bg-surface px-2 text-foreground-subtle">
                Or quick login as
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              className="h-9"
              onClick={() => {
                form.setValue("email", "admin@example.com")
                form.setValue("password", "Admin@123")
                form.handleSubmit(onSubmit)()
              }}
            >
              Demo Admin
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              className="h-9"
              onClick={() => {
                form.setValue("email", "agent@example.com")
                form.setValue("password", "Agent@123")
                form.handleSubmit(onSubmit)()
              }}
            >
              Demo Agent
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
