"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Calendar, Clock, Video, Search, Phone, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import { DoctorLayout } from "@/components/doctor/doctor-layout"
import { RoleProtector } from "@/components/auth/role-protector"
import { mockDoctorData } from "@/lib/mock-data"
import { useLanguage } from "@/components/language/language-provider"
import { GoogleMeetButton } from "@/components/common/google-meet-button"
import { DoctorEmergencyAlerts } from "@/components/doctor/emergency-alerts"


export default function DoctorDashboard() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [doctor] = useState(mockDoctorData.doctors[0])
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergencyAlert(true)
      // Play alert sound
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(1000, context.currentTime) // 1000 Hz
      oscillator.connect(context.destination)
      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        context.close()
      }, 1000) // Play sound for 1 second
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // TODO: Fetch real patient data from backend
  // TODO: Implement real-time patient status updates
  // TODO: Add patient filtering and sorting
  const filteredPatients = doctor.patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleVideoCall = (patientId: string) => {
    // TODO: Integrate with actual video calling service
    // TODO: Create meeting room and send invitation
    // TODO: Log call in patient records
    console.log(`Starting video call with patient ${patientId}`)
  }

  return (
    <RoleProtector allowedRoles={["doctor"]}>
  <DoctorLayout>
  <div className="space-y-6 mt-16">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("welcome")}, {doctor.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t("doctorDashboardSubtitle")}</p>
        </div>

        {/* Emergency Alerts */}
        {showEmergencyAlert && <DoctorEmergencyAlerts />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalPatients")}</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctor.totalPatients}</div>
              <p className="text-xs text-muted-foreground">+2 {t("thisWeek")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("todayAppointments")}</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctor.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">3 {t("completed")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pendingReviews")}</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctor.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">{t("requiresAttention")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("avgConsultTime")}</CardTitle>
              <Video className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24m</div>
              <p className="text-xs text-muted-foreground">-2m {t("fromLastWeek")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchPatients")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("patientQueue")}</CardTitle>
            <CardDescription>{t("patientQueueDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{patient.condition}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={getUrgencyColor(patient.urgency)}>
                          {patient.urgency === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {patient.urgency === "low" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {t(patient.urgency)} {t("priority")}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {t("lastVisit")}: {patient.lastVisit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t("chat")}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {t("call")}
                    </Button>
                    <GoogleMeetButton patientName={patient.name} onStartCall={() => handleVideoCall(patient.id)} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t("todaySchedule")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doctor.todaySchedule.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                      {t(appointment.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
    </RoleProtector>
  )
}
