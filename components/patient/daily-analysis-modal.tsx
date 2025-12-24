"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Calendar, FileText, Phone, Download } from "lucide-react"
import { useLanguage } from "@/components/language/language-provider"
import jsPDF from 'jspdf'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface LocationItem {
  name: string
  address?: string
  mapUrl?: string
}

interface DailyAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  analysisMarkdown?: string | null
  error?: string | null
  unusual?: string[]
  suggestions?: string | null
  locations?: LocationItem[]
  emergency?: boolean
  raw?: any
}

function parseDailySections(markdown: string) {
  const sections: any = {}
  const summaryMatch = markdown.match(/###\s*Summary[\s\S]*?(?=###|$)/i)
  const unusualMatch = markdown.match(/###\s*(Unusual|Notable) Findings[\s\S]*?(?=###|$)/i)
  const suggestionsMatch = markdown.match(/###\s*Suggestions[\s\S]*?(?=###|$)/i)
  const facilitiesMatch = markdown.match(/###\s*(Nearby|Facilities)[\s\S]*?(?=###|$)/i)
  if (summaryMatch) sections.summary = summaryMatch[0]
  if (unusualMatch) sections.unusual = unusualMatch[0]
  if (suggestionsMatch) sections.suggestions = suggestionsMatch[0]
  if (facilitiesMatch) sections.facilities = facilitiesMatch[0]
  return sections
}

export function DailyAnalysisModal({ isOpen, onClose, analysisMarkdown, error, unusual = [], suggestions, locations = [], emergency, raw }: DailyAnalysisModalProps) {
  const { t } = useLanguage()
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')

  let markdownSections: any = null
  if (analysisMarkdown) markdownSections = parseDailySections(analysisMarkdown)

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = 210
    const margin = 16
    let y = margin

    doc.setFontSize(16)
    doc.text('Daily Vitals Analysis', pageWidth / 2, y, { align: 'center' })
    y += 8
    doc.setFontSize(11)
    if (analysisMarkdown) {
      const lines = doc.splitTextToSize(analysisMarkdown, pageWidth - margin * 2)
      lines.forEach((l) => { doc.text(l, margin, y); y += 5 })
    }
    if (locations && locations.length) {
      y += 6
      doc.setFontSize(12)
      doc.text('Nearby Facilities', margin, y)
      y += 6
      locations.forEach(loc => {
        doc.setFontSize(10)
        doc.text(`${loc.name} - ${loc.address || ''}`, margin, y)
        y += 5
        if (loc.mapUrl) { doc.text(loc.mapUrl, margin, y); y += 5 }
      })
    }
    doc.save('Daily_Vitals_Analysis.pdf')
  }

  const handleSaveToRecords = async () => {
    setSaveStatus('saving')
    try {
      const payload = { analysis: raw ?? analysisMarkdown, unusual, suggestions, locations, emergency }
      const res = await fetch('/api/patient/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) setSaveStatus('saved')
      else setSaveStatus('error')
    } catch (e) {
      setSaveStatus('error')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-sky-500" />
            <span>Daily Vitals Analysis</span>
          </DialogTitle>
          <DialogDescription>Automated analysis of today's vitals and recent trends.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-semibold text-red-700">Error</div>
            <div className="text-gray-600">{error}</div>
          </div>
        )}

        {!error && !analysisMarkdown && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-lg font-semibold">Analyzing vitals…</div>
            <div className="text-gray-600">Please wait while we summarize your inputs.</div>
          </div>
        )}

        {!error && analysisMarkdown && (
          <div className="space-y-4">
            {markdownSections?.summary ? (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownSections.summary}</ReactMarkdown>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisMarkdown}</ReactMarkdown>
                </CardContent>
              </Card>
            )}

            {((unusual && unusual.length) || markdownSections?.unusual) && (
              <Card>
                <CardHeader>
                  <CardTitle>Unusual findings</CardTitle>
                </CardHeader>
                <CardContent>
                  {unusual && unusual.length > 0 ? (
                    <ul className="list-disc ml-5 space-y-1">
                      {unusual.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownSections.unusual}</ReactMarkdown>
                  )}
                </CardContent>
              </Card>
            )}

            {((suggestions && suggestions.length) || markdownSections?.suggestions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestions ? <div className="whitespace-pre-wrap text-sm">{suggestions}</div> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownSections.suggestions}</ReactMarkdown>}
                </CardContent>
              </Card>
            )}

            {locations && locations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Clinics & Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {locations.map((loc, idx) => (
                      <li key={idx} className="mb-2">
                        <div className="font-semibold">{loc.name}</div>
                        {loc.address && <div className="text-sm">{loc.address}</div>}
                        {loc.mapUrl && <div className="text-sm mt-1"><a href={loc.mapUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Maps Directions</a></div>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <a href="/patient/appointments">
                <Button className="flex-1 px-12">
                  <Phone className="h-4 w-4 mr-2" />
                  Consult Doctor
                </Button>
              </a>
              <Button variant="outline" className="flex-1 px-12" onClick={handleSaveToRecords} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
                <FileText className="h-4 w-4 mr-2" />
                {saveStatus === 'saved' ? 'Saved' : 'Save to records'}
              </Button>
              <Button variant="outline" className="flex-1 px-12" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DailyAnalysisModal
