"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Paperclip, Mic, MoreVertical, Phone, Video } from "lucide-react"
import { PatientLayout } from "@/components/patient/patient-layout"
import { mockChatData } from "@/lib/mock-data"
import { useLanguage } from "@/components/language/language-provider"
import { EmergencySOSButton } from "@/components/emergency/emergency-sos-button"

// Simple language detection for Hinglish (Hindi written in English)
const detectLanguage = (text: string): "en" | "hi" => {
  const hindiWords = [
    "kya",
    "hai",
    "mera",
    "mujhe",
    "aap",
    "main",
    "hoon",
    "kar",
    "kaise",
    "kahan",
    "kyun",
    "kab",
    "kaun",
    "kitna",
    "bahut",
    "thoda",
    "accha",
    "bura",
    "dard",
    "pet",
    "sir",
    "paani",
    "khana",
    "dawai",
    "doctor",
    "sahab",
    "ji",
    "nahi",
    "haan",
    "theek",
    "problem",
    "issue",
    "help",
    "madad",
    "samjha",
    "samjhi",
    "fever",
    "bukhar",
    "headache",
    "sirdard",
    "stomach",
    "pet",
    "pain",
    "dard",
    "medicine",
    "dawai",
    "tablet",
    "syrup",
    "injection",
    "suyi",
  ]

  const words = text.toLowerCase().split(" ")
  const hindiWordCount = words.filter((word) => hindiWords.includes(word)).length

  // If more than 20% of words are Hindi/Hinglish, consider it Hindi
  return hindiWordCount / words.length > 0.2 ? "hi" : "en"
}

export default function PatientChatPage() {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState(mockChatData.messages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString(),
      type: "text" as const,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // TODO: Send message to backend API
    // TODO: Implement real-time messaging with WebSocket
    // TODO: Add message encryption for security
    // TODO: Store chat history in database

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage),
        sender: "ai" as const,
        timestamp: new Date().toLocaleTimeString(),
        type: "text" as const,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (userMessage: string): string => {
    const detectedLang = detectLanguage(userMessage)
    const currentLang = language === "hi" ? "hi" : detectedLang

    // Enhanced AI responses based on detected language
    const responses = {
      en: [
        "I understand your concern. Can you provide more details about when these symptoms started?",
        "Based on what you've described, I recommend monitoring your symptoms. If they persist, please consult with a doctor.",
        "Thank you for the additional information. Let me analyze your symptoms and provide recommendations.",
        "I've noted your symptoms. Would you like me to connect you with a doctor for further evaluation?",
        "It sounds like you're experiencing some discomfort. Can you tell me more about the severity and duration?",
        "I'm here to help you with your health concerns. Please describe your symptoms in detail.",
        "Based on your description, this could be related to several factors. Let me ask you a few more questions.",
        "I recommend keeping track of your symptoms. Have you noticed any patterns or triggers?",
      ],
      hi: [
        "Main aapki pareshani samajh sakta hun. Kya aap bata sakte hain ki ye lakshan kab se shuru hue hain?",
        "Aapne jo bataya hai, uske hisaab se main suggest karunga ki aap apne symptoms ko monitor kariye. Agar ye continue rahe to doctor se miliye.",
        "Additional information ke liye dhanyawad. Main aapke symptoms ka analysis kar ke recommendations dunga.",
        "Maine aapke symptoms note kar liye hain. Kya aap chahte hain ki main aapko doctor se connect kar dun further evaluation ke liye?",
        "Lagta hai aap kuch discomfort feel kar rahe hain. Kya aap severity aur duration ke baare mein aur bata sakte hain?",
        "Main yahan hun aapki health concerns mein help karne ke liye. Kripaya apne symptoms detail mein describe kariye.",
        "Aapke description ke hisaab se, ye kai factors se related ho sakta hai. Main aapse kuch aur questions puchta hun.",
        "Main recommend karunga ki aap apne symptoms ka track rakhiye. Kya aapne koi patterns ya triggers notice kiye hain?",
      ],
    }

    const langResponses = responses[currentLang]
    return langResponses[Math.floor(Math.random() * langResponses.length)]
  }

  const formatTime = (timestamp: string) => {
    return new Date(`2024-01-01 ${timestamp}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <PatientLayout>
      <div className="relative max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* SOS Button at top right */}
        <div className="absolute top-4 right-4 z-50">
          <EmergencySOSButton />
        </div>
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{t("aiAssistant")}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{t("online")}</span>
                      <Badge variant="secondary" className="text-xs">
                        {language === "hi" ? "हिंदी सहायक" : "Multilingual Support"}
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
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      {message.sender === "user" ? (
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      ) : message.sender === "ai" ? (
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender !== "user" && (
                          <Badge variant="secondary" className="text-xs">
                            {message.sender === "ai" ? t("ai") : t("doctor")}
                          </Badge>
                        )}
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
                        <Bot className="h-4 w-4" />
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
              {/* Language Detection Indicator */}
              {newMessage && (
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {detectLanguage(newMessage) === "hi"
                      ? "🇮🇳 Hindi detected - AI will respond in Hindi"
                      : "🇺🇸 English detected - AI will respond in English"}
                  </span>
                  <span className="text-blue-500">Current UI: {language === "hi" ? "हिंदी" : "English"}</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "अपना संदेश टाइप करें... (Hindi ya English mein)"
                      : "Type your message... (in Hindi or English)"
                  }
                  className="flex-1"
                  disabled={isTyping}
                />
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
    </PatientLayout>
  )
}
