"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Auth page replaced: immediately navigate to /role-select
export default function AuthPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Send users to role select page instead of the removed auth UI
    router.replace('/role-select')
  }, [router])

  return null
}