"use client"

import { useState, useEffect } from "react"
import { DoctorEmergencyAlerts } from "@/components/doctor/emergency-alerts"
import { PoliceLayout } from "@/components/police/police-layout"
import { RoleProtector } from "@/components/auth/role-protector"

export default function PoliceDashboard() {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergencyAlert(true)
      // Play buzzer sound
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(1000, context.currentTime) // 1000 Hz buzzer sound
      oscillator.connect(context.destination)
      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        context.close()
      }, 1500) // Play sound for 1.5 seconds
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <RoleProtector allowedRoles={["police"]}>
      <PoliceLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Emergency Alerts</h2>
          {!showEmergencyAlert && (
            <div className="p-6 bg-green-100 text-green-800 rounded-lg border border-green-300">
              There are currently no emergency alerts.
            </div>
          )}
          {showEmergencyAlert && <DoctorEmergencyAlerts />}
        </div>
      </PoliceLayout>
    </RoleProtector>
  )
}
