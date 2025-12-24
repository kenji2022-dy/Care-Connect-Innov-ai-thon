"use client"

import { PatientLayout } from "@/components/patient/patient-layout"
import React, { useEffect, useState } from "react"
import DailyAnalysisModal from "@/components/patient/daily-analysis-modal"
import { useExp } from "@/components/exp/exp-context"

type VitalsEntry = {
  date: string
  temperature?: number
  heartRate?: number
  respiratoryRate?: number
  spo2?: number
  weight?: number
  glucose?: number
  pain?: number
  notes?: string
}

const COOKIE_NAME = "dailyCheckins"

function getCookie(name: string) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
  return v ? decodeURIComponent(v[2]) : null
}

function getTodayISTDate(offsetDays = 0) {
  // Convert current time to UTC ms, then add IST offset (5.5 hours) and subtract offsetDays
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const istOffset = 5.5 * 60 * 60000
  const target = new Date(utc + istOffset - offsetDays * 86400000)
  return target.toISOString().slice(0, 10)
}

function setCookie(name: string, value: string, days = 30) {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${d.toUTCString()}`
}

function seedMockData(): VitalsEntry[] {
  const days = [2, 1, 0]
  return days.map((d, i) => {
    const date = getTodayISTDate(d)
    return {
      date,
      temperature: 36 + i * 0.5,
      heartRate: 70 + i * 3,
      respiratoryRate: 16,
      spo2: 97 - i,
      weight: 72 + i * 0.2,
      glucose: 90 + i * 4,
      pain: i === 2 ? 2 : 1,
      notes: i === 2 ? "Feeling fine" : ""
    }
  })
}

export default function DailyCheckinPage() {
  const { addExp } = useExp()
  const [entries, setEntries] = useState<VitalsEntry[]>([])
  const [form, setForm] = useState<VitalsEntry>({ date: getTodayISTDate() })
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // load from cookie or seed
    const raw = getCookie(COOKIE_NAME)
    if (!raw) {
      const seeded = seedMockData()
      setCookie(COOKIE_NAME, JSON.stringify(seeded), 60)
      setEntries(seeded)
    } else {
      try {
        const parsed: any[] = JSON.parse(raw)
        // sanitize older entries that may include removed BP fields
        const cleaned: VitalsEntry[] = parsed.map(p => {
          const { systolic, diastolic, ...rest } = p
          return rest as VitalsEntry
        })
        setEntries(cleaned)
      } catch (e) {
        const seeded = seedMockData()
        setCookie(COOKIE_NAME, JSON.stringify(seeded), 60)
        setEntries(seeded)
      }
    }
  }, [])

  function updateField<K extends keyof VitalsEntry>(k: K, v: VitalsEntry[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function saveToCookies(nextEntries: VitalsEntry[]) {
    // sanitize before saving
    const cleaned = nextEntries.map(e => {
      const { /* systolic, diastolic, */ ...rest } = e as any
      return rest
    })
    setCookie(COOKIE_NAME, JSON.stringify(cleaned), 60)
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
  // prepare entry (force today's date in IST)
  const entry: VitalsEntry = { ...form, date: getTodayISTDate() }
    // update entries (replace today's if exists)
    const idx = entries.findIndex(en => en.date === entry.date)
    let next = [...entries]
    if (idx >= 0) next[idx] = entry
    else next.unshift(entry)
    // keep at most 30
    next = next.slice(0, 30)
    setEntries(next)
    saveToCookies(next)

    // attempt to get geolocation (optional)
    const getPosition = () => new Promise<{ lat: number; lon: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      )
    })

    const coords = await getPosition()

    try {
      const res = await fetch('/api/patient/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieStorage: next, location: coords })
      })
      const data = await res.json()

  try { addExp(5, 'api:patient:dailyCheckin', { path: '/api/patient/daily-checkin' }) } catch {}

      // if emergency and we don't have locations, generate google maps links using coords
      if (data.emergency && (!data.locations || data.locations.length === 0)) {
        const locs = [] as any[]
        if (coords) {
          const { lat, lon } = coords
          locs.push({ name: 'Nearest Hospital', address: 'Search nearby hospitals', mapUrl: `https://www.google.com/maps/search/hospital/@${lat},${lon},13z` })
          locs.push({ name: 'Nearest Clinic', address: 'Search nearby clinics', mapUrl: `https://www.google.com/maps/search/clinic/@${lat},${lon},13z` })
        } else {
          locs.push({ name: 'Nearest Hospital', address: 'Search hospitals near me', mapUrl: 'https://www.google.com/maps/search/hospital+near+me' })
        }
        data.locations = locs
      }

      setAnalysis(data)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      setAnalysis({ error: 'Failed to get analysis' })
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PatientLayout>
        <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Daily Vitals Check-in</h1>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white shadow rounded p-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
            <span className="text-sm text-gray-700">Date</span>
            <div className="mt-1 p-2 border rounded bg-gray-50 text-gray-800">{getTodayISTDate()}</div>
            </div>

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">Temperature (°C)</span>
            <input type="number" step="0.1" value={form.temperature ?? ''} onChange={s => updateField('temperature', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">Heart rate (bpm)</span>
            <input type="number" value={form.heartRate ?? ''} onChange={s => updateField('heartRate', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

      {/* Systolic/Diastolic removed from flow per requirement */}

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">Respiratory Rate (breaths/min)</span>
            <input type="number" value={form.respiratoryRate ?? ''} onChange={s => updateField('respiratoryRate', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">SpO2 (%)</span>
            <input type="number" value={form.spo2 ?? ''} onChange={s => updateField('spo2', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">Weight (kg)</span>
            <input type="number" value={form.weight ?? ''} onChange={s => updateField('weight', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
            <span className="text-sm text-gray-700">Glucose (mg/dL)</span>
            <input type="number" value={form.glucose ?? ''} onChange={s => updateField('glucose', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col md:col-span-2">
            <span className="text-sm text-gray-700">Pain (0-10)</span>
            <input type="number" min={0} max={10} value={form.pain ?? ''} onChange={s => updateField('pain', s.target.value === '' ? undefined : Number((s.target as HTMLInputElement).value))} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col md:col-span-2">
            <span className="text-sm text-gray-700">Notes</span>
            <textarea value={form.notes ?? ''} onChange={s => updateField('notes', (s.target as HTMLTextAreaElement).value)} className="mt-1 p-2 border rounded min-h-[80px]" />
            </label>

            <div className="md:col-span-2 flex items-center justify-between">
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded shadow" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            <button type="button" className="text-sm text-gray-600 underline" onClick={() => { setForm({ date: getTodayISTDate() }) }}>Reset</button>
            </div>
        </form>

        <section className="mt-6">
            <h2 className="text-lg font-medium mb-2">Recent entries</h2>
            <div className="space-y-2">
            {entries.length === 0 && <div className="text-sm text-gray-600">No entries yet</div>}
            {entries.map((en) => (
                <div key={en.date} className="p-3 bg-white shadow rounded flex justify-between items-start">
                <div>
                    <div className="text-sm font-medium">{en.date}</div>
                    <div className="text-xs text-gray-600">Temp: {en.temperature ?? '—'} °C • HR: {en.heartRate ?? '—'} bpm</div>
                    <div className="text-xs text-gray-600">SpO2: {en.spo2 ?? '—'}% • RR: {en.respiratoryRate ?? '—'}</div>
                </div>
                <div className="text-right">
                    <button className="text-sky-600 text-sm" onClick={() => { setForm({ ...en, date: getTodayISTDate() }) }}>Edit</button>
                </div>
                </div>
            ))}
            </div>
        </section>

        <DailyAnalysisModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          error={analysis?.error ?? null}
          analysisMarkdown={analysis?.summary ?? analysis?.raw?.gemini ?? null}
          unusual={analysis?.unusual ?? []}
          suggestions={analysis?.suggestions ?? null}
          locations={analysis?.locations ?? []}
          emergency={!!analysis?.emergency}
          raw={analysis?.raw ?? null}
        />
        </div>
    </PatientLayout>
  )
}
