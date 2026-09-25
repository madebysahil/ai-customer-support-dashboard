import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background-subtle p-4 overflow-hidden">
      {/* Subtle geometric background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20" aria-hidden="true">
        <svg className="h-full w-full stroke-border" width="100%" height="100%">
          <defs>
            <pattern id="auth-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V0h32" fill="none" strokeWidth="1" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-center">
        {/* Modern SVG Brand Emblem */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md ring-1 ring-border/20">
          <svg
            className="h-6 w-6 text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Precision geometric pilot delta emblem with core telemetry node */}
            <path d="M12 2L20 20L12 16L4 20L12 2Z" />
            <circle cx="12" cy="10" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">SupportPilot</h1>
          <p className="text-sm text-foreground-muted max-w-xs">
            Enterprise AI Customer Support & Copilot Platform
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
