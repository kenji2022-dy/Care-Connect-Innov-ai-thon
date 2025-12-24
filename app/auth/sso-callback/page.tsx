"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const router = useRouter()

  useEffect(() => {
    // After SSO callback, route to role selection
    router.replace('/role-select')
  }, [router])

  return null
}
