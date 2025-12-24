"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, MessageSquare, FileText, LogOut, Activity, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language/language-provider"
import { LanguageToggle } from "@/components/language/language-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { PWAInstallBanner } from "@/components/pwa/pwa-install-banner"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { DoctorExpProvider, useDoctorExp } from "@/components/exp/doctor-exp-context"
import { Logo } from "@/components/common/logo"

interface DoctorLayoutProps {
  children: ReactNode
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Ensure we're in doctor context
  useEffect(() => {
    if (!pathname.startsWith("/doctor")) {
      // If not in doctor routes, redirect to doctor dashboard
      router.push("/doctor/dashboard")
    }
  }, [pathname, router])

  const navigation = [
    { name: t("dashboard"), href: "/doctor/dashboard", icon: Home },
    { name: t("patients"), href: "/doctor/patients", icon: Users },
    { name: t("appointments"), href: "/doctor/appointments", icon: Calendar },
    { name: t("chat"), href: "/doctor/chat", icon: MessageSquare },
    { name: t("reports"), href: "/doctor/reports", icon: FileText },
    { name: t("analytics"), href: "/doctor/analytics", icon: Activity },
    { name: t("resources"), href: "/doctor/resources", icon: BookOpen }
  ]

  const handleLogout = () => {
    // Redirect to role selection (authentication removed)
    router.push("/role-select")
  }

  return (
    <DoctorExpProvider>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PWAInstallBanner />
      <OfflineIndicator />

      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden"
              >
                {isMobileSidebarOpen ? <span className="sr-only">Close</span> : <span className="sr-only">Open</span>}
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clipRule="evenodd" /></svg>
              </Button>
            )}
            <Logo size="md" variant="pro" className="text-green-900 dark:text-green-100" isLanding={false} />
          </div>
          <div className="flex items-center space-x-4">
            <DoctorExpDisplay />
            <LanguageToggle />
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Navigation Sidebar (offset under header) */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isMobile ? (isMobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64') : 'w-64'}`} style={{ top: '64px' }}>
        <div className="flex flex-col h-full">

          {/* User Info */}
          <div className="px-6 py-4 bg-green-25 dark:bg-green-900/10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">SS</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Ananya Mehta</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t("doctor")} - {t("generalMedicine")}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={() => { if (isMobile) setIsMobileSidebarOpen(false) }}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive ? "bg-green-600 text-white" : "hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* User Actions (sticky bottom) */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0 bg-white dark:bg-gray-800 z-10">

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
    </DoctorExpProvider>
  )
}

// Doctor-specific EXP display (isolated state)
function DoctorExpDisplay() {
  try {
    const { exp, events } = useDoctorExp()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!ref.current) return
        if (!ref.current.contains(e.target as Node)) setOpen(false)
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false)
      }
      document.addEventListener("mousedown", onDoc)
      document.addEventListener("keydown", onKey)
      return () => {
        document.removeEventListener("mousedown", onDoc)
        document.removeEventListener("keydown", onKey)
      }
    }, [])

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((s) => !s)}
          className="flex items-center space-x-2 focus:outline-none"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
          <Badge className="px-2 py-1 cursor-pointer">{exp}</Badge>
        </button>

        <div
          className={`origin-top-right right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all duration-150 ease-out ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
          style={{ position: "absolute", zIndex: 60 }}
          role="dialog"
          aria-hidden={!open}
        >
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-semibold">XP Activity</div>
            <div className="text-xs text-gray-500">Total: {exp}</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No XP activity yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {events.map((ev) => (
                  <li key={ev.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{ev.reason ?? "xp"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(ev.ts).toLocaleString()}</div>
                      {ev.meta && Object.keys(ev.meta).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">{JSON.stringify(ev.meta)}</div>
                      )}
                    </div>
                    <div className={`text-sm font-semibold ${ev.delta >= 0 ? "text-green-600" : "text-red-600"}`}>{ev.delta >= 0 ? `+${ev.delta}` : ev.delta}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-right">
            <button onClick={() => setOpen(false)} className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-300">Close</button>
          </div>
        </div>
      </div>
    )
  } catch (e) {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
        <Badge className="px-2 py-1">0</Badge>
      </div>
    )
  }
}
