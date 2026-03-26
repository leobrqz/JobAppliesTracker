"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, Briefcase, Building2, CalendarDays, LayoutDashboard, Settings, User } from "lucide-react"
import { toast } from "sonner"

import { hardSignOutAndRedirect } from "@/lib/supabase/auth-session"

const NAV_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/platforms", label: "Platforms", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function onLogout() {
    try {
      await hardSignOutAndRedirect()
    } catch {
      toast.error("Failed to end session. Redirecting to login.")
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r bg-card px-3 py-6">
      <div className="mb-8 px-2">
        <span className="text-base font-semibold tracking-tight">JobTracker</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto px-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md border px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-accent"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
