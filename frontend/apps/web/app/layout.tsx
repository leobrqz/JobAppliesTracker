import type { Metadata } from "next"

import "@workspace/ui/globals.css"

export const metadata: Metadata = {
  title: "JobAppliesTracker",
  description: "Frontend scaffold for JobAppliesTracker.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
