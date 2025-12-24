"use client"

import React, { useState } from 'react'

export default function PrescriptionParser() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<any | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setTranscription(null)
    const f = e.target.files && e.target.files[0]
    setFile(f ?? null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTranscription(null)
    if (!file) {
      setError('Please select an image file first.')
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file, file.name)

      const res = await fetch('/api/transcribe-prescription', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Upload failed')
      } else if (!json?.success) {
        setError(json?.error || 'AI failed to transcribe the image')
      } else {
        setTranscription(json.transcription)
      }
    } catch (err: any) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Prescription Transcription</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block"
        />

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Transcribing...' : 'Upload & Transcribe'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-3">Processing image, please wait...</div>
      )}

      {error && (
        <div className="mt-3 text-red-600" role="alert">
          {error}
        </div>
      )}

      {transcription && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Transcription</h3>

          <table className="w-full table-auto border-collapse">
            <tbody>
              <tr>
                <th className="text-left pr-4">Patient</th>
                <td>{transcription.patientInfo?.name ?? '—'}</td>
              </tr>
              <tr>
                <th className="text-left pr-4">Patient Details</th>
                <td>{transcription.patientInfo?.details ?? '—'}</td>
              </tr>
              <tr>
                <th className="text-left pr-4">Clinic</th>
                <td>{transcription.clinicInfo?.name ?? '—'}</td>
              </tr>
              <tr>
                <th className="text-left pr-4">Date</th>
                <td>{transcription.prescriptionDate ?? '—'}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <h4 className="font-semibold">Medications</h4>
            {Array.isArray(transcription.medications) && transcription.medications.length > 0 ? (
              <table className="w-full mt-2 border">
                <thead>
                  <tr className="bg-gray-100">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Dosage</th>
                      <th className="p-2 text-left">Used For</th>
                    </tr>
                </thead>
                <tbody>
                  {transcription.medications.map((m: any, idx: number) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 align-top">{m.name ?? '—'}</td>
                      <td className="p-2 align-top">{m.dosage ?? '—'}</td>
                      <td className="p-2 align-top">{m.usedFor ?? m.duration ?? m.instructions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="mt-2">No medications found.</div>
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Additional Advice</h4>
            {Array.isArray(transcription.additionalAdvice) && transcription.additionalAdvice.length > 0 ? (
              <table className="w-full mt-2 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Dosage</th>
                    <th className="p-2 text-left">Used For</th>
                  </tr>
                </thead>
                <tbody>
                  {transcription.additionalAdvice.map((a: any, idx: number) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 align-top">{a.item ?? '—'}</td>
                      <td className="p-2 align-top">{a.dosage ?? '—'}</td>
                      <td className="p-2 align-top">{a.usedFor ?? a.duration ?? a.instructions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="mt-2">No additional advice found.</div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">{transcription.disclaimer}</div>
        </div>
      )}
    </div>
  )
}
