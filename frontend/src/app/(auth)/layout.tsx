import { Sparkles } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-subtle p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background shadow-md">
          <span className="font-bold text-2xl">S</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">SupportPilot</h1>
        <p className="text-sm text-foreground-muted">Enterprise AI Customer Support</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
