"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { SidebarNav } from "./SidebarNav"
import { CommandPalette } from "@/components/ui/command-palette"

import {
  Menu,
  Search,
  Command,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  Palette,
  LogOut,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/toaster"

export function CommandHeader() {
  const { setTheme, theme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCmdkOpen, setIsCmdkOpen] = useState(false)

  // Automatically close the mobile menu when the user navigates to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCmdkOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoggingOut(true)
    await logout()
    // Intentionally not setting isLoggingOut to false since component will unmount on redirect
  }

  return (
    <>
      <header className="flex h-12 items-center gap-2 md:gap-4 border-b bg-surface px-4 md:px-6 shadow-sm z-10 shrink-0">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground-muted hover:text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-0">
              <div className="flex h-full flex-col py-6 overflow-y-auto">
                <SidebarNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-4 w-full flex-1">
          <div className="hidden sm:block">
            <button 
              className="relative group flex items-center w-full md:w-[320px] lg:w-[400px] h-8 bg-background-subtle border border-border hover:border-primary text-foreground-muted hover:text-foreground px-3 rounded-md transition-colors"
              onClick={() => setIsCmdkOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">Search anything...</span>
              <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold bg-surface px-1.5 py-0.5 rounded border border-border">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-md h-8 w-8 text-foreground-muted hover:text-foreground hover:bg-background-subtle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-md h-8 w-8 text-foreground-muted hover:text-foreground hover:bg-background-subtle"
            onClick={() => toast({ title: "You have 2 new high-priority tickets!" })}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-critical border border-surface" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-1 h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                <Avatar className="h-8 w-8 border border-border-subtle">
                  <AvatarImage src={user?.avatarUrl || "https://github.com/shadcn.png"} alt={user?.fullName || "User"} />
                  <AvatarFallback className="text-[11px] font-medium">{user?.role === 'ADMINISTRATOR' ? 'AD' : 'JD'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 p-1">
                  <p className="text-sm font-semibold leading-none text-foreground">{user?.fullName || 'John Doe'}</p>
                  <p className="text-[11px] leading-none text-foreground-muted">
                    {user?.email || 'admin@supportpilot.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4 text-foreground-muted" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4 text-foreground-muted" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  <Palette className="mr-2 h-4 w-4 text-foreground-muted" />
                  <span>Toggle Theme</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="text-critical focus:text-critical focus:bg-critical/10 cursor-pointer transition-colors font-medium py-2"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={isCmdkOpen} onOpenChange={setIsCmdkOpen} />
    </>
  )
}
