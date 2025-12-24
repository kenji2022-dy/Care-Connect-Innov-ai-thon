"use client"

declare global {
  interface Window {
    loadAgent: (config: { agentId: string; xApiKey: string; variables: Record<string, string> }) => void;
  }
}

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Home, FileText, MessageSquare, Calendar, LogOut, Plus, Bot, MapPin, Pill, Activity, AlarmClock, SoupIcon, Menu, X, Target, Scan, BicepsFlexed, Dumbbell, LifeBuoy, VideoIcon, ScanLine, PenTool, Videotape } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language/language-provider"
import { LanguageToggle } from "@/components/language/language-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useExp } from "@/components/exp/exp-context"
import { Badge } from "@/components/ui/badge"
import { PWAInstallBanner } from "@/components/pwa/pwa-install-banner"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { useEffect, useState, useRef } from "react"
import { Logo } from "@/components/common/logo"
import { EmergencySOSButton } from "../emergency/emergency-sos-button"

interface PatientLayoutProps {
  children: ReactNode
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Ensure we're in patient context
  useEffect(() => {
    if (!pathname.startsWith("/patient")) {
      // If not in patient routes, redirect to patient dashboard
      router.push("/patient/dashboard")
    }
  }, [pathname, router])

  // Inject DesiVocal Agent script (replaced with compact loader)
  useEffect(() => {
    const loadAgentsCdn = (e: string, t: () => void) => {
      const n = document.createElement("link")
      n.rel = "stylesheet"
      n.type = "text/css"
      n.href = `https://cdn.jsdelivr.net/npm/@desivocal/agents-cdn@${e}/dist/style.css`

      const a = document.createElement("script")
      a.type = "text/javascript"

      // Support older readyState model and modern onload
      if ((a as any).readyState) {
        ;(a as any).onreadystatechange = function () {
          if ((a as any).readyState === "loaded" || (a as any).readyState === "complete") {
            ;(a as any).onreadystatechange = null
            t()
          }
        }
      } else {
        a.onload = function () {
          t()
        }
      }

      a.src = `https://cdn.jsdelivr.net/npm/@desivocal/agents-cdn@${e}/dist/dv-agent.es.js`
      document.getElementsByTagName("head")[0].appendChild(n)
      document.getElementsByTagName("head")[0].appendChild(a)
    }

    loadAgentsCdn("1.0.3", () => {
      if (typeof window.loadAgent === "function") {
        window.loadAgent({
          agentId: "9046fcfe-7e8e-43ab-92aa-40f3ca65d44b",
          xApiKey: "f8216410-1cbe-4947-8fd8-1714db827172",
          variables: { callee_name: "Sri Hasnika" },
        })
      } else {
        console.warn("DesiVocal agent script loaded but `loadAgent` not found.")
      }
    })
  }, [])


  const navigation = [
    { name: t("dashboard"), href: "/patient/dashboard", icon: Home },
    { name: t("symptomScreening"), href: "/patient/symptoms", icon: Plus },
    { name: t("medReminder"), href: "/patient/med-reminder", icon: AlarmClock },
    { name: t("postOpFollowup"), href: "/patient/postop-followup", icon: Activity },
    { name: t("recipes"), href: "/patient/recipes", icon: SoupIcon },
    { name: t("workout"), href: "/patient/workout", icon: BicepsFlexed },
    { name: t("scanAnalysis"), href: "/patient/diagnosys", icon: Scan },
    { name: t("nearbyHospitals"), href: "/patient/hospitals", icon: MapPin },
    { name: t("scenarioLab"), href: "/patient/simulation", icon: LifeBuoy },
    { name: t("resources"), href: "/patient/resources", icon: VideoIcon },
    
    { name: t("healthFitnessPlan"), href: "/patient/health-plan", icon: Dumbbell },
    
    { name: t("noticeInterpreter"), href: "/patient/notice-interpreter", icon: ScanLine },
    { name: t("transcribePrescription"), href: "/patient/transcribe-prescription", icon: PenTool },
    { name: t("aiPrescriptions"), href: "/patient/ai-prescriptions", icon: Bot },
    { name: t("prescriptions"), href: "/patient/prescriptions", icon: Pill },
    { name: t("dailyCheckin"), href: "/patient/daily-checkin", icon: FileText },
    { name: t("appointments"), href: "/patient/appointments", icon: Calendar },
    { name: t("medicalRecords"), href: "/patient/records", icon: FileText },
    
    // { name: t("videoGen"), href: "/patient/video-gen", icon: Videotape },
    { name: t("goals"), href: "/patient/goals", icon: Target },
    // { name: t("chat"), href: "/patient/chat", icon: MessageSquare },
  ]

  const handleLogout = () => {
    // TODO: Clear user session and tokens
    // TODO: Call logout API endpoint
    // TODO: Clear local storage/cookies
    router.push("/role-select")
  }

  const handleNavigationClick = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PWAInstallBanner />
      <OfflineIndicator />

      {/* Sticky Header with Logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden"
              >
                {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <Logo size="md" variant="default" className="text-blue-900 dark:text-blue-100" isLanding={false} />
            
          </div>
          <div className="flex items-center space-x-4">
            {/* EXP display synced across the app */}
            <ExpDisplay />
            <LanguageToggle />
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
          isMobile 
            ? (isMobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64')
            : 'w-64'
        }`}
        style={{ top: '64px' }} // Account for sticky header height
      >
        <div
          className="flex flex-col h-full overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 64px)' }}
        >
          {/* User Info */}
          <div className={`py-4 bg-blue-25 dark:bg-blue-900/10 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 px-6`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">D</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Sri Hasnika</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{t("patient")}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-2 transition-all duration-300 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={handleNavigationClick}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full transition-all duration-300 ${
                      isActive ? "bg-blue-600 text-white" : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    } justify-start`}
                    title={undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="ml-3">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* User Actions (Sticky Logout) */}
          <div className="border-t border-gray-200 dark:border-gray-700 transition-all duration-300 p-4 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isMobile ? 'ml-0' : 'ml-64'
      }`} style={{ marginTop: '64px' }}>
        <main className="p-8">{children}</main>
      </div>
      {/* Emergency SOS Button - fixed position */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <EmergencySOSButton />
      </div>
    </div>
  )
}

// Small EXP display component
function ExpDisplay() {
  // Interactive XP dropdown showing recent events from the ExpProvider ledger
  try {
    const { exp, events } = useExp()
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

        {/* Animated dropdown/modal */}
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
    // If provider not available, show placeholder
    return (
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
        <Badge className="px-2 py-1">0</Badge>
      </div>
    )
  }
}
