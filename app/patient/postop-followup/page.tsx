"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientLayout } from "@/components/patient/patient-layout"
import { Label } from "@/components/ui/label"
import { Activity, PhoneCall, AlertCircle } from "lucide-react"

const metrics = [
  { key: "pain", label: "Pain Level", emojis: ["😀", "🙂", "😐", "😣", "😭"] },
  { key: "nausea", label: "Nausea", emojis: ["😀", "🙂", "😐", "🤢", "🤮"] },
  { key: "sleep", label: "Sleep Quality", emojis: ["😴", "🙂", "😐", "😫", "😵"] },
]

export default function PostOpFollowupPage() {
  const [form, setForm] = useState({ pain: "", nausea: "", sleep: "" })
  const [history, setHistory] = useState<any[]>([])
  const [escalate, setEscalate] = useState(false)

  // Voice AI call state
  const [phoneNumber, setPhoneNumber] = useState("+917981367685")
  const [patientName, setPatientName] = useState("Demo Patient")
  const [surgeryType, setSurgeryType] = useState("General Surgery")
  const [daysPostOp, setDaysPostOp] = useState("3")
  const [isCallInitiating, setIsCallInitiating] = useState(false)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  const handleVoiceAICall = async () => {
  setIsCallInitiating(true)
  setCallStatus("Initiating post-op follow-up call...")
  setCallError(null)

  try {
    const response = await fetch("https://api.bolna.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer bn-02590b7cc5304c5080b19d944265bc72`, // ⚠️ exposed in frontend
      },
      body: JSON.stringify({
        agent_id: "e11b9d92-699f-473c-97bb-ac285158ccb9", // ✅ post-op follow-up agent
        recipient_phone_number: "+917981367685", 
      }),
    })

    const data = await response.json()
    console.log("Voice agent response:", data)

    if (response.ok) {
      setCallStatus("✅ Post-op follow-up call initiated successfully!")
      setTimeout(() => setCallStatus(null), 5000)
    } else {
      setCallError(data.error || "Failed to initiate call")
      setTimeout(() => setCallError(null), 5000)
    }
  } catch (err) {
    console.error("Error connecting to voice AI service:", err)
    setCallError("❌ Error connecting to voice AI service")
    setTimeout(() => setCallError(null), 5000)
  } finally {
    setIsCallInitiating(false)
  }
}


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const entry = { ...form, date: new Date().toLocaleString() }
    setHistory([entry, ...history])
    if (form.pain === "😭" || form.nausea === "🤮" || form.sleep === "😵") {
      setEscalate(true)
    } else {
      setEscalate(false)
    }
    setForm({ pain: "", nausea: "", sleep: "" })
  }

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Activity className="h-7 w-7 text-pink-500" /> Post-Op Daily Check-In
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">
            Please complete your daily recovery check-in. If your symptoms worsen, your care team will be alerted.
          </p>
        </div>

        {/* Voice AI Call Section */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              <span>Voice AI Post-Op Follow-Up</span>
            </CardTitle>
            <CardDescription>
              Get a post-operative follow-up call from our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div>
              <Label htmlFor="phoneNumber">Phone Number (with country code)</Label>
              <input
                id="phoneNumber"
                type="tel"
                className="w-full border rounded px-3 py-2 mt-1"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+917981367685"
              />
            </div>
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <input
                id="patientName"
                type="text"
                className="w-full border rounded px-3 py-2 mt-1"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Patient Name"
              />
            </div>
            <div>
              <Label htmlFor="surgeryType">Surgery Type</Label>
              <input
                id="surgeryType"
                type="text"
                className="w-full border rounded px-3 py-2 mt-1"
                value={surgeryType}
                onChange={e => setSurgeryType(e.target.value)}
                placeholder="General Surgery"
              />
            </div>
            <div>
              <Label htmlFor="daysPostOp">Days Post-Op</Label>
              <input
                id="daysPostOp"
                type="number"
                className="w-full border rounded px-3 py-2 mt-1"
                value={daysPostOp}
                onChange={e => setDaysPostOp(e.target.value)}
                placeholder="3"
                min={0}
              />
            </div> */}
            <Button
              type="button"
              onClick={handleVoiceAICall}
              disabled={isCallInitiating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCallInitiating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initiating Voice AI Call...
                </>
              ) : (
                <>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Start Voice AI Post-Op Follow-Up
                </>
              )}
            </Button>
            
          </CardContent>
        </Card>

        {/* Check-In Form */}
        <Card className="shadow-md border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Today's Check-In</CardTitle>
            <CardDescription>Tap the emoji that best matches how you feel for each metric.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {metrics.map((metric) => (
                <div key={metric.key} className="mb-4">
                  <Label className="block mb-3 font-medium text-gray-800 text-base">
                    {metric.label}
                  </Label>
                  <div className="flex gap-4 justify-center">
                    {metric.emojis.map((emoji) => (
                      <label key={emoji} htmlFor={`${metric.key}-${emoji}`} className="flex flex-col items-center cursor-pointer group">
                        <input
                          type="radio"
                          id={`${metric.key}-${emoji}`}
                          name={metric.key}
                          value={emoji}
                          checked={form[metric.key as keyof typeof form] === emoji}
                          onChange={() => setForm((f) => ({ ...f, [metric.key]: emoji }))}
                          className="peer sr-only"
                        />
                        <span
                          className={
                            `text-3xl transition-transform duration-150 ` +
                            (form[metric.key as keyof typeof form] === emoji
                              ? "scale-125 drop-shadow-lg"
                              : "opacity-60 group-hover:opacity-90")
                          }
                          aria-label={emoji}
                        >
                          {emoji}
                        </span>
                        <span className={
                          form[metric.key as keyof typeof form] === emoji
                            ? "block mt-1 w-2 h-2 rounded-full bg-blue-500"
                            : "block mt-1 w-2 h-2 rounded-full bg-gray-200"
                        }></span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-6">
                <Button type="submit" className="px-8 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
                  Submit
                </Button>
              </div>
            </form>
            {escalate && (
              <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded text-red-700 text-center">
                <strong>Warning:</strong> Your responses indicate a possible complication. <br />
                {/* <span>// TODO: Escalation alert to care team</span> */}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Check-In History</CardTitle>
            <CardDescription>Your recent responses</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center">No check-ins yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((entry, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50">
                    <div className="flex gap-6 text-2xl justify-center md:justify-start">
                      <span title="Pain" aria-label="Pain">{entry.pain}</span>
                      <span title="Nausea" aria-label="Nausea">{entry.nausea}</span>
                      <span title="Sleep" aria-label="Sleep">{entry.sleep}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 md:mt-0 text-center md:text-right">{entry.date}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
} 
