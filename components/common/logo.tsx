"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  variant?: "default" | "pro"
  className?: string
  isLanding: boolean
}

export function Logo({ size = "md", showText = true, variant = "default", className = "", isLanding = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src="/images/careconnect-logo.png"
        alt="CareConnect Logo"
        className={`object-contain ${sizeClasses[size]} rounded-full`}
      />
      {showText && !isLanding && (
        <h1 className={`font-bold ${textSizeClasses[size]}`}>Care Connect</h1>
      )}
    </div>
  )
}
