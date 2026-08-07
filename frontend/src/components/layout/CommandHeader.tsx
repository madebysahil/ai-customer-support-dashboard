"use client"

import React, { useState } from "react"
import { Bell, Search, Sun, Moon, Sparkles, Command } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

import { SidebarNav } from "./SidebarNav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { User, Settings, Palette, Keyboard, HelpCircle, LogOut, Loader2 } from "lucide-react"

// Simple toast helper
const showToast = (message: string) => {
  const el = document.createElement("div");
  el.className = "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-bottom-5";
  el.innerText = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => el.remove(), 500);
  }, 3000);
};

export function CommandHeader() {
  const { setTheme, theme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoggingOut(true)
    await logout()
    // Intentionally not setting isLoggingOut to false since component will unmount on redirect
  }

  return (
    <header className="flex h-16 items-center gap-2 md:gap-4 border-b bg-background px-4 md:px-6 shadow-sm z-10 shrink-0">
      {/* Mobile Menu Trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
        <form className="hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              type="search"
              placeholder="Search anything... (Cmd+K)"
              className="w-full md:w-[320px] lg:w-[400px] appearance-none bg-muted/40 pl-10 border-transparent focus-visible:bg-background focus-visible:border-primary shadow-inner-soft rounded-full transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Badge variant="success" className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          AI Online
        </Badge>
        
        <div className="h-6 w-px bg-border hidden lg:block mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => showToast("You have 2 new high-priority tickets!")}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-[9px] top-[9px] flex h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ml-1 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
              <div className="relative">
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarImage src={user?.avatarUrl || "https://github.com/shadcn.png"} alt={user?.fullName || "User"} />
                  <AvatarFallback>{user?.role === 'ADMINISTRATOR' ? 'AD' : 'JD'}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1.5 p-1">
                <p className="text-sm font-semibold leading-none">{user?.fullName || 'John Doe'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@supportpilot.com'}
                </p>
                <Badge variant="secondary" className="w-fit mt-1 text-[10px] uppercase tracking-wider">
                  {user?.role || 'Administrator'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Palette className="mr-2 h-4 w-4" />
                <span>Theme</span>
                <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Keyboard Shortcuts</span>
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer transition-colors font-medium"
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
  )
}
