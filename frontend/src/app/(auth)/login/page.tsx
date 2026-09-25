"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
  KeyRound
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type LoginFormValues = z.infer<typeof loginSchema>

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)

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

  function handleSSOLogin(provider: "google" | "saml") {
    setSsoLoading(provider)
    setErrorMsg("")
    setTimeout(() => {
      setSsoLoading(null)
      setErrorMsg(
        `Enterprise SSO (${provider === "google" ? "Google Workspace" : "SAML 2.0 / Okta"}) redirect is simulated. Please sign in using local credentials or demo logins below.`
      )
    }, 400)
  }

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1.5 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-foreground-muted">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMsg && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-md border border-critical/20 bg-critical/10 p-3 text-sm text-critical font-medium text-left"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Enterprise SSO Mockup Actions (FEAT-AUTH-05) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || ssoLoading !== null}
            className="h-9 text-xs font-medium border-border hover:bg-surface-raised transition-colors flex items-center justify-center gap-2"
            onClick={() => handleSSOLogin("google")}
          >
            {ssoLoading === "google" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-muted" />
            ) : (
              <GoogleIcon className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>Continue with Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading || ssoLoading !== null}
            className="h-9 text-xs font-medium border-border hover:bg-surface-raised transition-colors flex items-center justify-center gap-2"
            onClick={() => handleSSOLogin("saml")}
          >
            {ssoLoading === "saml" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-muted" />
            ) : (
              <KeyRound className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            )}
            <span>Continue with SAML SSO</span>
          </Button>
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-wider">
            <span className="bg-surface px-2 text-foreground-subtle">
              Or continue with email
            </span>
          </div>
        </div>

        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input field (FEAT-AUTH-02, FEAT-AUTH-04) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-foreground block">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              className={cn(
                form.formState.errors.email && "border-critical focus-visible:ring-critical/20"
              )}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p id="email-error" className="flex items-center gap-1.5 text-xs text-critical font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{form.formState.errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password input field (FEAT-AUTH-02, FEAT-AUTH-03, FEAT-AUTH-04) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none text-foreground block">
                Password
              </label>
              <a href="#" className="text-xs text-foreground-muted hover:text-foreground transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                className={cn(
                  "pr-10",
                  form.formState.errors.password && "border-critical focus-visible:ring-critical/20"
                )}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-0 h-full px-3 py-2 text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-r-md transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p id="password-error" className="flex items-center gap-1.5 text-xs text-critical font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{form.formState.errors.password.message}</span>
              </p>
            )}
          </div>

          <Button
            className="w-full h-10 font-medium"
            type="submit"
            disabled={isLoading || ssoLoading !== null}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-0 pb-6">
        <div className="relative w-full my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-wider">
            <span className="bg-surface px-2 text-foreground-subtle">
              Or quick login as
            </span>
          </div>
        </div>

        {/* Enhanced quick demo credential injectors (FEAT-AUTH-06) */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isLoading || ssoLoading !== null}
            className="h-10 justify-between px-3 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => {
              form.setValue("email", "admin@example.com")
              form.setValue("password", "Admin@123")
              form.handleSubmit(onSubmit)()
            }}
          >
            <span className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>Demo Admin</span>
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider shrink-0">
              Admin
            </span>
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            disabled={isLoading || ssoLoading !== null}
            className="h-10 justify-between px-3 text-xs font-medium hover:border-info/50 hover:bg-info/5 transition-all"
            onClick={() => {
              form.setValue("email", "agent@example.com")
              form.setValue("password", "Agent@123")
              form.handleSubmit(onSubmit)()
            }}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Users className="h-3.5 w-3.5 text-info shrink-0" aria-hidden="true" />
              <span>Demo Agent</span>
            </span>
            <span className="rounded bg-info/10 px-1.5 py-0.5 text-[9px] font-semibold text-info uppercase tracking-wider shrink-0">
              Agent
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
