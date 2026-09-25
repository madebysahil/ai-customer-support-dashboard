import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Providers } from "@/components/providers/Providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AI Customer Support Dashboard",
  description: "Enterprise SaaS platform for AI-powered customer support.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} font-sans min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
