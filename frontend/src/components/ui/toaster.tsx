"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastProps = {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    const handleToast = (e: CustomEvent<Omit<ToastProps, "id">>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast = { ...e.detail, id }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }

    window.addEventListener("add-toast" as any, handleToast)
    return () => window.removeEventListener("add-toast" as any, handleToast)
  }, [])

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
            t.variant === "destructive" ? "destructive group border-critical bg-critical text-white" : 
            t.variant === "success" ? "border-success bg-success text-white" : 
            "border-border bg-surface text-foreground"
          )}
        >
          <div className="grid gap-1">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            className="absolute right-2 top-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function toast(props: Omit<ToastProps, "id">) {
  window.dispatchEvent(new CustomEvent("add-toast", { detail: props }))
}
