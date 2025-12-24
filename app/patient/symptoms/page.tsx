"use client"
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, AlertCircle, CheckCircle, AlertTriangle, Stethoscope, Phone, PhoneCall } from "lucide-react"
import { PatientLayout } from "@/components/patient/patient-layout"
import { useLanguage } from "@/components/language/language-provider"
import { DiagnosisModal } from "@/components/patient/diagnosis-modal"
import { useExp } from "@/components/exp/exp-context"

export default function SymptomsPage() {
  const { t } = useLanguage()
  const { addExp } = useExp()
  const [formData, setFormData] = useState({
    symptoms: "",
    severity: "",
    duration: "",
    bodyPart: "",
    additionalInfo: "",
    phoneNumber: "+917981367685", // Default phone number
  })
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCallInitiating, setIsCallInitiating] = useState(false)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [triageAdvice, setTriageAdvice] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<any | null>(null)
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null)
  const [diagnosisMarkdown, setDiagnosisMarkdown] = useState<string | null>(null)

  const commonSymptoms = [
    "Headache",
    "Fever",
    "Cough",
    "Sore Throat",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Chest Pain",
    "Shortness of Breath",
    "Joint Pain",
  ]

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // TODO: Implement image validation (size, format)
    // TODO: Upload images to cloud storage
    // TODO: Generate thumbnails for preview
    setUploadedImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.symptoms.trim() && selectedSymptoms.length === 0) {
      newErrors.symptoms = t("symptomsRequired")
    }
    if (!formData.severity) {
      newErrors.severity = t("severityRequired")
    }
    if (!formData.duration) {
      newErrors.duration = t("durationRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function saveRecordToLocalStorage(record: any) {
    if (typeof window === 'undefined') return;
    try {
      const key = "careconnect_patient_records";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([record, ...existing]));
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setDiagnosis(null);
    setDiagnosisError(null);
    setImageAnalysis(null);
    setDiagnosisMarkdown(null);

    // 1. Get user location
    let userLocation = null;
    try {
      userLocation = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) return reject('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err)
        );
      });
    } catch (err) {
      // If location denied, continue without location
      userLocation = null;
    }

    // 2. Build enhanced AI prompt
    const symptomsText = formData.symptoms || selectedSymptoms.join(", ");
    const additionalInfo = formData.additionalInfo;
    const locationText = userLocation ? `Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng}` : 'Location not available';

    const aiPrompt = `You are a virtual healthcare assistant.\n\nPatient symptoms: ${symptomsText}\nAdditional info: ${additionalInfo}\nPatient location: ${locationText}\n\nYour tasks:\n1. Analyze the symptoms and provide a likely diagnosis, severity, and recommendations.\n2. List at least 3 hospitals, 2 clinics, and 1 pharmacy near the given location. For each, provide:\n   - Name, address, phone number\n   - Google Maps directions link from the user's location\n   - Step-by-step driving directions (road to road, turn by turn)\n3. Suggest a list of medications that can be purchased at Apollo Pharmacy or online (Amazon, Medlife, etc.), with direct order links.\n4. Write a positive, doctor-tone script for an AI video (max 2 min) that:\n   - Briefs about the condition\n   - Mentions 3 nearby hospitals, 1 pharmacy (with estimated travel durations)\n   - Lists a few recommended medications.\n   - The script should be friendly, reassuring, and informative.\n\nFormat your response in clear sections: Diagnosis, Nearby Facilities, Medications, Doctor Video Script.`;

    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          symptoms: symptomsText,
          additionalInfo,
          location: userLocation,
        }),
      });
      const data = await response.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        setDiagnosisError(null);
        setDiagnosisMarkdown(null);
        try { addExp(5, 'api:patient:symptomsAnalyze', { path: '/api/symptoms/analyze' }) } catch {}
        // Save the exact API response to localStorage
        const record = {
          id: Date.now().toString(),
          source: 'symptoms',
          response: data,
          date: new Date().toISOString()
        };
        saveRecordToLocalStorage(record);
      } else {
        setDiagnosis(null);
        setDiagnosisError(data.error || 'Unknown error');
        setDiagnosisMarkdown(data.diagnosisMarkdown || null);
      }
    } catch {
      setDiagnosis(null);
      setImageAnalysis(null);
      setDiagnosisError('Error analyzing symptoms.');
    } finally {
      setIsSubmitting(false);
      setShowDiagnosis(true);
    }
  };

  const initiateVoiceAICall = async () => {
  if (!formData.phoneNumber.trim()) {
    setErrors(prev => ({ ...prev, phoneNumber: "Phone number is required" }))
    return
  }

  setIsCallInitiating(true)
  setCallStatus("Initiating voice AI call...")

  try {
    const response = await fetch("https://api.bolna.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer bn-02590b7cc5304c5080b19d944265bc72`, // ⚠️ exposed in frontend
      },
      body: JSON.stringify({
        agent_id: "72446715-a229-4b4c-9224-21477a4c333d",
        recipient_phone_number: "+917981367685",  
      }),
    })

    const data = await response.json()
    console.log("Voice agent response:", data)

    if (response.ok) {
      setCallStatus("✅ Voice AI call initiated successfully!")
      try { addExp(5, 'api:patient:voiceCall', { path: 'https://api.bolna.ai/call' }) } catch {}
      setTimeout(() => setCallStatus(null), 5000)
    } else {
      setCallStatus(`❌ Failed to initiate call: ${data.error || "Unknown error"}`)
      setTimeout(() => setCallStatus(null), 5000)
    }
  } catch (error) {
    console.error("Error initiating voice AI call:", error)
    setCallStatus("❌ Error connecting to voice AI service")
    setTimeout(() => setCallStatus(null), 5000)
  } finally {
    setIsCallInitiating(false)
  }
}


  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("symptomScreening")}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t("symptomsFormDesc")}</p>
        </div>

        {/* Voice AI Call Section */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PhoneCall className="h-5 w-5 text-blue-600" />
                <span>Voice AI Symptom Screening</span>
              </CardTitle>
              <CardDescription>
                Get instant symptom assessment through our AI voice assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div>
                <Label htmlFor="phoneNumber">Phone Number (with country code)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+917981367685"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div> */}
              
              <Button
                type="button"
                onClick={initiateVoiceAICall}
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
                    Start Voice AI Symptom Screening
                  </>
                )}
              </Button>

              
            </CardContent>
          </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>{t("commonSymptoms")}</CardTitle>
              <CardDescription>{t("selectApplicableSymptoms")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonSymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <Label htmlFor={symptom} className="text-sm">
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedSymptoms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t("selectedSymptoms")}:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleSymptomToggle(symptom)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Description */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detailedDescription")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="symptoms">{t("additionalSymptoms")}</Label>
                <Textarea
                  id="symptoms"
                  placeholder={t("describeSymptomsPlaceholder")}
                  value={formData.symptoms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                  className={errors.symptoms ? "border-red-500" : ""}
                />
                {errors.symptoms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.symptoms}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="severity">{t("severity")}</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger className={errors.severity ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("selectSeverity")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">{t("mild")}</SelectItem>
                      <SelectItem value="moderate">{t("moderate")}</SelectItem>
                      <SelectItem value="severe">{t("severe")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
                </div>

                <div>
                  <Label htmlFor="duration">{t("duration")}</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("selectDuration")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">{t("fewHours")}</SelectItem>
                      <SelectItem value="days">{t("fewDays")}</SelectItem>
                      <SelectItem value="weeks">{t("fewWeeks")}</SelectItem>
                      <SelectItem value="months">{t("fewMonths")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <Label htmlFor="bodyPart">{t("affectedArea")}</Label>
                  <Input
                    id="bodyPart"
                    placeholder={t("bodyPartPlaceholder")}
                    value={formData.bodyPart}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bodyPart: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>{t("uploadImages")}</CardTitle>
              <CardDescription>{t("uploadImagesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{t("dragDropImages")}</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    {t("selectImages")}
                  </Button>
                </Label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t("uploadedImages")}:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-xs text-center p-2">{file.name}</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("additionalInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t("additionalInfoPlaceholder")}
                value={formData.additionalInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
              />
            </CardContent>
          </Card>

          

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              {t("saveDraft")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("submitSymptoms")}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Loading State */}
        {isSubmitting && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <h3 className="text-lg font-semibold">{t("analyzingSymptoms")}</h3>
                <p className="text-gray-600">{t("aiAnalysisInProgress")}</p>
                <Progress value={66} className="w-full max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Triage Advice Card */}
        {triageAdvice && (
          <Card className="border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 my-4">
            <CardHeader className="flex flex-row items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-500" />
              <CardTitle>Triage Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {triageAdvice === "self-treat" && (
                  <span className="text-green-700">Self-treat at home. Monitor your symptoms.</span>
                )}
                {triageAdvice === "consult GP" && (
                  <span className="text-yellow-700">Consult your general practitioner soon.</span>
                )}
                {triageAdvice === "go to ER" && (
                  <span className="text-red-700">Go to the emergency room immediately!</span>
                )}
              </div>
              {/* <div className="text-xs text-gray-500 mt-2">// TODO: Integrate symptom analysis backend for real triage advice</div> */}
            </CardContent>
          </Card>
        )}

        {/* Diagnosis Modal */}
        {imageAnalysis ? (
          <DiagnosisModal isOpen={showDiagnosis} onClose={() => setShowDiagnosis(false)} diagnosis={null} error={imageAnalysis} />
        ) : (
          <DiagnosisModal isOpen={showDiagnosis} onClose={() => setShowDiagnosis(false)} diagnosis={diagnosis} error={diagnosisError} diagnosisMarkdown={diagnosisMarkdown} />
        )}
      </div>
    </PatientLayout>
  )
}
