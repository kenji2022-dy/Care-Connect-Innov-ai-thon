"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, User, Paperclip, Mic, MoreVertical, Phone, Video, Stethoscope } from "lucide-react"
import { DoctorLayout } from "@/components/doctor/doctor-layout"
import { mockDoctorData } from "@/lib/mock-data"
import { useLanguage } from "@/components/language/language-provider"

export default function DoctorChatPage() {
  const { t } = useLanguage()
  const [selectedPatient, setSelectedPatient] = useState("john-doe")
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Hello Dr. Smith, I've been experiencing some chest discomfort since yesterday.",
      sender: "patient" as const,
      timestamp: "2:30 PM",
      type: "text" as const,
    },
    {
      id: "2",
      content:
        "I understand your concern. Can you describe the type of discomfort? Is it sharp, dull, or pressure-like?",
      sender: "doctor" as const,
      timestamp: "2:32 PM",
      type: "text" as const,
    },
    {
      id: "3",
      content: "It feels like pressure, especially when I take deep breaths. It's not constant but comes and goes.",
      sender: "patient" as const,
      timestamp: "2:35 PM",
      type: "text" as const,
    },
    {
      id: "4",
      content:
        "Thank you for the details. Have you experienced any shortness of breath, dizziness, or nausea along with this discomfort?",
      sender: "doctor" as const,
      timestamp: "2:37 PM",
      type: "text" as const,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [doctor] = useState(mockDoctorData.doctors[0])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const doctorMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "doctor" as const,
      timestamp: new Date().toLocaleTimeString(),
      type: "text" as const,
    }

    setMessages((prev) => [...prev, doctorMessage])
    setNewMessage("")

    // TODO: Send message to backend API
    // TODO: Implement real-time messaging with WebSocket
    // TODO: Add message encryption for security
    // TODO: Store chat history in patient records
    // TODO: Notify patient of new message
  }

  const formatTime = (timestamp: string) => {
    return new Date(`2024-01-01 ${timestamp}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const currentPatient = doctor.patients.find((p) => p.id === selectedPatient) || doctor.patients[0]

  return (
  <DoctorLayout>
  <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex gap-4 mt-16">
        {/* Patient List Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {doctor.patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                    selectedPatient === patient.id ? "bg-green-50 dark:bg-green-900/20 border-green-200" : ""
                  }`}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                      <p className="text-xs text-gray-500 truncate">{patient.condition}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            patient.urgency === "high"
                              ? "border-red-200 text-red-600"
                              : patient.urgency === "medium"
                                ? "border-yellow-200 text-yellow-600"
                                : "border-green-200 text-green-600"
                          }`}
                        >
                          {patient.urgency}
                        </Badge>
                        {selectedPatient === patient.id && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{currentPatient.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{t("online")}</span>
                      <Badge variant="secondary" className="text-xs">
                        {currentPatient.condition}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Stethoscope className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${
                      message.sender === "doctor" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      {message.sender === "doctor" ? (
                        <AvatarFallback>
                          <Stethoscope className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "doctor" ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${message.sender === "doctor" ? "text-green-100" : "text-gray-500"}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {message.sender === "doctor" ? "Dr. Smith" : currentPatient.name.split(" ")[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[70%]">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your medical advice..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Select defaultValue="normal">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button type="submit" disabled={!newMessage.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  )
}
