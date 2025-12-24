"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, MessageSquare, Plus, Activity, Heart, Thermometer, Weight, AlarmClock } from "lucide-react"
import { PatientLayout } from "@/components/patient/patient-layout"
import { RoleProtector } from "@/components/auth/role-protector"
import { mockPatientData } from "@/lib/mock-data"
import { useLanguage } from "@/components/language/language-provider"
import Link from "next/link"

export default function PatientDashboard() {
  const { t } = useLanguage()
  const [patient] = useState(mockPatientData.patients[0])

  return (
    
      <PatientLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("welcome")}, Sri Hasnika!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t("dashboardSubtitle")}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("heartRate")}</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72 bpm</div>
              <p className="text-xs text-muted-foreground">{t("normal")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("temperature")}</CardTitle>
              <Thermometer className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">37°C</div>
              <p className="text-xs text-muted-foreground">{t("normal")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("weight")}</CardTitle>
              <Weight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75 kg</div>
              <p className="text-xs text-muted-foreground">{t("stable")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("lastCheckup")}</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">{t("weeksAgo")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/symptoms">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>{t("symptomScreening")}</span>
                </CardTitle>
                <CardDescription>{t("reportSymptomsDesc")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/med-reminder">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlarmClock className="h-5 w-5 text-blue-500" />
                  <span>{t("medReminder")}</span>
                </CardTitle>
                <CardDescription>{t("medReminderDesc")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/postop-followup">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-pink-500" />
                  <span>{t("postOpFollowup")}</span>
                </CardTitle>
                <CardDescription>{t("postOpFollowupDesc")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/records">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{t("viewRecords")}</span>
                </CardTitle>
                <CardDescription>{t("viewRecordsDesc")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/chat">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>{t("chatWithAI")}</span>
                </CardTitle>
                <CardDescription>{t("chatWithAIDesc")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/patient/health-plan">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Health & Fitness Plan</span>
                </CardTitle>
                <CardDescription>Get a personalized, holistic health and fitness plan</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div> */}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patient.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <Badge variant={activity.type === "appointment" ? "default" : "secondary"}>{activity.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t("upcomingAppointments")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patient.upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.doctor}</p>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open the in-app WebRTC page and pass the doctor's name as a query param
                      const doctorName = encodeURIComponent(appointment.id)
                      const url = `/webrtc?friend=${doctorName}`
                      window.open(url, "_blank")
                    }}
                  >
                    {t("joinCall")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}
