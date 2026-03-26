import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@workspace/ui/components/sonner"

import "@workspace/ui/globals.css"

import { AppFrame } from "./AppFrame"

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
          <AppFrame>{children}</AppFrame>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
