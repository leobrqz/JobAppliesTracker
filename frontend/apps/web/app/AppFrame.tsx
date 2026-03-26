"use client"

import { usePathname } from "next/navigation"

import { Sidebar } from "./Sidebar"

type Props = {
  children: React.ReactNode
}

const PUBLIC_ROUTES = ["/", "/login", "/register"]

export function AppFrame({ children }: Props) {
  const pathname = usePathname()
  const isPublic = PUBLIC_ROUTES.includes(pathname)

  if (isPublic) {
    return <main className="mx-auto w-full max-w-6xl px-6">{children}</main>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

