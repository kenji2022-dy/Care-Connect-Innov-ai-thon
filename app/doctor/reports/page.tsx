"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react"
import { DoctorLayout } from "@/components/doctor/doctor-layout"
import { useLanguage } from "@/components/language/language-provider"

export default function DoctorReports() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("thisMonth")

  // TODO: Fetch reports from backend API
  // TODO: Implement report generation and export
  // TODO: Add real-time report updates
  const mockReports = [
    {
      id: "1",
      title: "Monthly Patient Summary",
      type: "summary",
      date: "2024-01-15",
      status: "completed",
      patients: 156,
      description: "Comprehensive overview of patient consultations and outcomes",
    },
    {
      id: "2",
      title: "Treatment Effectiveness Analysis",
      type: "analysis",
      date: "2024-01-12",
      status: "completed",
      patients: 89,
      description: "Analysis of treatment success rates and patient recovery times",
    },
    {
      id: "3",
      title: "Prescription Audit Report",
      type: "audit",
      date: "2024-01-10",
      status: "pending",
      patients: 234,
      description: "Review of prescribed medications and dosage patterns",
    },
    {
      id: "4",
      title: "Patient Satisfaction Survey",
      type: "survey",
      date: "2024-01-08",
      status: "completed",
      patients: 67,
      description: "Patient feedback and satisfaction ratings for consultations",
    },
    {
      id: "5",
      title: "Appointment Analytics",
      type: "analytics",
      date: "2024-01-05",
      status: "completed",
      patients: 198,
      description: "Analysis of appointment patterns, no-shows, and scheduling efficiency",
    },
  ]

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || report.type === filterType
    return matchesSearch && matchesFilter
  })

  const getReportIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <FileText className="h-5 w-5" />
      case "analysis":
        return <TrendingUp className="h-5 w-5" />
      case "audit":
        return <CheckCircle className="h-5 w-5" />
      case "survey":
        return <User className="h-5 w-5" />
      case "analytics":
        return <Activity className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleGenerateReport = (type: string) => {
    // TODO: Implement report generation
    console.log(`Generating ${type} report`)
  }

  const handleDownloadReport = (reportId: string) => {
    // TODO: Implement report download
    console.log(`Downloading report ${reportId}`)
  }

  return (
    <DoctorLayout>
      <div className="space-y-6 mt-16">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("reports")}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Generate and manage medical reports and analytics</p>
          </div>
          <Button onClick={() => handleGenerateReport("custom")}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReports.length}</div>
              <p className="text-xs text-muted-foreground">Generated this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReports.filter((r) => r.status === "completed").length}</div>
              <p className="text-xs text-muted-foreground">Ready for download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReports.filter((r) => r.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Covered</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReports.reduce((sum, report) => sum + report.patients, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">{getReportIcon(report.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          <Badge variant="outline" className="capitalize">
                            {report.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{report.date}</span>
                          </div>
                          <span>•</span>
                          <span>{report.patients} patients</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {report.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredReports
              .filter((report) => report.status === "completed")
              .map((report) => (
                <Card key={report.id} className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{report.description}</p>
                          <p className="text-sm text-green-600 font-medium">Ready for download</p>
                        </div>
                      </div>
                      <Button onClick={() => handleDownloadReport(report.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredReports
              .filter((report) => report.status === "pending")
              .map((report) => (
                <Card key={report.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{report.description}</p>
                          <p className="text-sm text-yellow-600 font-medium">Processing...</p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Processing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Patient Summary", description: "Comprehensive patient overview" },
                { name: "Treatment Analysis", description: "Treatment effectiveness report" },
                { name: "Prescription Audit", description: "Medication review and audit" },
                { name: "Satisfaction Survey", description: "Patient feedback analysis" },
                { name: "Appointment Analytics", description: "Scheduling and attendance report" },
                { name: "Custom Report", description: "Build your own report template" },
              ].map((template, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReport(template.name.toLowerCase())}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  )
}
