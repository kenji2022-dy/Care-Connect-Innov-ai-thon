"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, AlarmClock, Plus, Bell, Edit2 } from "lucide-react"
import { PatientLayout } from "@/components/patient/patient-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface Medication {
  id: string
  name: string
  dose: string
  time: string
  taken: boolean
}

export default function MedReminderPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [form, setForm] = useState({ name: "", dose: "", time: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()
  const [isCallInitiating, setIsCallInitiating] = useState(false)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.dose || !form.time) return
    if (editingId) {
      setMedications((meds) =>
        meds.map((m) => (m.id === editingId ? { ...m, ...form } : m))
      )
      setEditingId(null)
    } else {
      setMedications((meds) => [
        ...meds,
        { ...form, id: Date.now().toString(), taken: false },
      ])
    }
    setForm({ name: "", dose: "", time: "" })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setMedications((meds) => meds.filter((m) => m.id !== id))
  }

  const handleEdit = (med: Medication) => {
    setForm({ name: med.name, dose: med.dose, time: med.time })
    setEditingId(med.id)
    setShowForm(true)
  }

  const handleMarkTaken = (id: string) => {
    setMedications((meds) =>
      meds.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    )
    toast({
      title: "Reminder",
      description: "Medication marked as taken.",
      duration: 2000,
    })
    // TODO: Log adherence to backend
    // TODO: Notify caregiver if missed
  }

 const handleDemoVoiceCall = async () => {
  setIsCallInitiating(true)
  setCallStatus("Initiating med-reminder voice call...")
  setCallError(null)

  try {
    const response = await fetch("https://api.bolna.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer bn-02590b7cc5304c5080b19d944265bc72`, // ⚠️ exposed in frontend
      },
      body: JSON.stringify({
        agent_id: "3534b450-207f-47a2-83f9-d2db3a512fae", // ✅ med-reminder agent
        recipient_phone_number: "+917981367685",          // ✅ static demo number
      }),
    })

    const data = await response.json()
    console.log(" Voice agent response:", data)

    if (response.ok) {
      setCallStatus("✅ Med-reminder call initiated! (Call will hang up after 10 seconds)")
      setTimeout(() => setCallStatus(null), 7000)
    } else {
      setCallError(data.error || "Failed to initiate call")
      setTimeout(() => setCallError(null), 7000)
    }
  } catch (err) {
    console.error("Error connecting to voice AI service:", err)
    setCallError("❌ Error connecting to voice AI service")
    setTimeout(() => setCallError(null), 7000)
  } finally {
    setIsCallInitiating(false)
  }
}


  // TODO: Integrate SMS/voice backend for reminders

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* Demo Voice Call Trigger */}
        <div className="mb-4">
          <Button
            type="button"
            onClick={handleDemoVoiceCall}
            disabled={isCallInitiating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCallInitiating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Initiating Demo Voice Reminder Call...
              </>
            ) : (
              <>
                <AlarmClock className="h-4 w-4 mr-2" />
                Demo Voice Reminder Call
              </>
            )}
          </Button>
          
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlarmClock className="h-7 w-7 text-blue-500" /> Medication Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your medication schedule and get reminders for each dose.
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Your current medication schedule</CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", dose: "", time: "" }) }}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Medication" : "Add Medication"}</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddOrEdit}>
                  <div>
                    <Label htmlFor="name">Medication Name</Label>
                    <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="dose">Dose</Label>
                    <Input id="dose" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Select value={form.time} onValueChange={val => setForm(f => ({ ...f, time: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="18:00">06:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit">{editingId ? "Save" : "Add"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {medications.length === 0 ? (
              <p className="text-gray-500">No medications set. Add your first reminder above.</p>
            ) : (
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        <Bell className={`h-4 w-4 ${med.taken ? "text-green-500" : "text-yellow-500 animate-pulse"}`} />
                        {med.name}
                        {med.taken ? (
                          <Badge variant="secondary" className="ml-2">Taken</Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-2">Due</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Dose: {med.dose} | Time: {med.time}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(med)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleMarkTaken(med.id)}>
                        {med.taken ? <Bell className="h-4 w-4 text-green-500" /> : <Bell className="h-4 w-4 text-yellow-500" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(med.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
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
