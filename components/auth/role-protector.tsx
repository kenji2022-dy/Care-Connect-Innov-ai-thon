"use client"
import React from 'react'

// Role protection removed per request. This component is now a no-op
// wrapper so pages that import it keep working without client-side
// redirects or role checks. Navigation to dashboards is handled by
// the role selection page which writes `userRole` to localStorage.

interface RoleProtectorProps {
  children: React.ReactNode
}

export function RoleProtector({ children }: RoleProtectorProps) {
  return <>{children}</>
}

// Utility: navigate to dashboard based on localStorage role. Callers
// may import this and pass `router.push` or call directly from a
// client component where `useRouter` is available.
export function navigateToRoleDashboard(push: (path: string) => void, fallback = '/role-select') {
  if (typeof window === 'undefined') return
  const role = localStorage.getItem('userRole')
  if (role) {
    push(`/${role}/dashboard`)
  } else {
    push(fallback)
  }
}
