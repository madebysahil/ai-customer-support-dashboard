import { SidebarNav } from "@/components/layout/SidebarNav"
import { CommandHeader } from "@/components/layout/CommandHeader"
import { RequireAuth } from "@/components/providers/RequireAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] bg-background">
        <div className="hidden border-r bg-muted/10 md:block z-10">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-4">
              <SidebarNav />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <CommandHeader />
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-muted/5">
            <div className="mx-auto max-w-6xl flex flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
