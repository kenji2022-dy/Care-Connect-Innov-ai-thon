"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Video } from "lucide-react"
import { useLanguage } from "@/components/language/language-provider"

interface GoogleMeetButtonProps {
  patientName?: string
  onStartCall?: () => void
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
}

export function GoogleMeetButton({
  patientName,
  onStartCall,
  size = "sm",
  variant = "default",
}: GoogleMeetButtonProps) {
  const { t } = useLanguage()

  const handleStartCall = () => {
    // Open the in-app WebRTC page instead of Google Meet
    // We open in a new tab so the user keeps context; the page provides a UI to start/register calls.
    const webRtcUrl = "/webrtc"
    window.open(webRtcUrl, "_blank")
    onStartCall?.()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleStartCall}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Video className="h-4 w-4 mr-2" />
            {t("startVideoCall")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{patientName ? `${t("startCallWith")} ${patientName}` : t("opensGoogleMeet")}</p>
          <p className="text-xs text-muted-foreground">Opens in-app video call</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
