"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

export type ExpEvent = {
  id: string
  delta: number
  reason?: string
  meta?: Record<string, any>
  ts: number
}

interface ExpContextValue {
  exp: number
  events: ExpEvent[]
  setExp: (v: number, reason?: string, meta?: Record<string, any>) => void
  addExp: (v: number, reason?: string, meta?: Record<string, any>) => void
  resetExp: (reason?: string) => void
}

const ExpContext = createContext<ExpContextValue | undefined>(undefined)

// Doctor-specific storage keys so patient and doctor XP remain separate
const STORAGE_KEY = "careconnect_exp_doctor_v1"
const STORAGE_EVENTS_KEY = "careconnect_exp_events_doctor_v1"

function loadNumber(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function loadEvents(): ExpEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function DoctorExpProvider({ children }: { children: React.ReactNode }) {
  const [exp, setExpState] = useState<number>(() => loadNumber())
  const [events, setEvents] = useState<ExpEvent[]>(() => loadEvents())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(exp))
    } catch {}
  }, [exp])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events))
    } catch {}
  }, [events])

  const pushEvent = useCallback((delta: number, reason?: string, meta?: Record<string, any>) => {
    const ev: ExpEvent = { id: String(Date.now()) + Math.random().toString(36).slice(2, 8), delta, reason, meta: meta || {}, ts: Date.now() }
    let added = false
    setEvents((s) => {
      try {
        if (meta && (meta as any).goalId) {
          const goalId = (meta as any).goalId
          const dup = s.find((e) => e.meta && (e.meta as any).goalId === goalId && e.reason === reason && e.delta === delta)
          if (dup) return s
        }
      } catch {}
      added = true
      return [ev, ...s]
    })
    return added
  }, [])

  const setExp = useCallback((v: number, reason?: string, meta?: Record<string, any>) => {
    const delta = v - loadNumber()
    if (delta === 0) return
    const added = pushEvent(delta, reason ?? "set", meta)
    if (added) {
      setExpState(v)
    }
  }, [pushEvent])

  const addExp = useCallback((v: number, reason?: string, meta?: Record<string, any>) => {
    try {
      const added = pushEvent(v, reason ?? "adjust", meta)
      if (!added) return
      setExpState((s) => s + v)
    } catch {
      setExpState((s) => s + v)
    }
  }, [pushEvent])

  const resetExp = useCallback((reason?: string) => {
    const added = pushEvent(0, reason ?? "reset")
    setExpState(0)
    if (!added) return
  }, [pushEvent])

  return (
    <ExpContext.Provider value={{ exp, events, setExp, addExp, resetExp }}>{children}</ExpContext.Provider>
  )
}

export function useDoctorExp() {
  const ctx = useContext(ExpContext)
  if (!ctx) throw new Error("useDoctorExp must be used within DoctorExpProvider")
  return ctx
}
