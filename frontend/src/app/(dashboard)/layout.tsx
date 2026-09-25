import { SidebarNav } from "@/components/layout/SidebarNav"
import { CommandHeader } from "@/components/layout/CommandHeader"
import { BottomNav } from "@/components/layout/BottomNav"
import { RequireAuth } from "@/components/providers/RequireAuth"
import { PageTransition } from "@/components/layout/PageTransition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen w-full bg-background-subtle">
        <div className="hidden md:block z-10 shrink-0">
          <SidebarNav />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <CommandHeader />
          <main className="flex-1 overflow-y-auto flex flex-col min-h-0 relative pb-14 md:pb-0">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  )
}
