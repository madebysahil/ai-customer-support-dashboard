"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error:", error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md text-center">
        An unexpected error occurred while loading this page. Our engineers have been notified.
      </p>
      <Button onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </div>
  )
}
