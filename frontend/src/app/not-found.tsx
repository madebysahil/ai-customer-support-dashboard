"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/40">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
      <p className="text-xl text-muted-foreground mb-8">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild className="mt-4">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
