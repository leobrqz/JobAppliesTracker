import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@workspace/ui/components/sonner"

import "@workspace/ui/globals.css"

import { Sidebar } from "./Sidebar"

export const metadata: Metadata = {
  title: "JobAppliesTracker",
  description: "Track and manage your job applications.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
