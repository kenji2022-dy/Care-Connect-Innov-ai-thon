"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, UserCheck, Shield, Activity, Brain, Heart, Stethoscope, Plus } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { LanguageToggle } from "@/components/language/language-toggle"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language/language-provider"
import { useUser, useClerk } from '@clerk/nextjs'

export default function RoleSelectPage() {
  const [userType, setUserType] = useState("patient")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const { t } = useLanguage()
  const { user, isLoaded: userLoaded } = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Redirect to auth if not signed in
  useEffect(() => {
    // Previously this redirected to `/auth` when user was not signed in.
    // Remove redirect so role selection can be shown and handled client-side.
    // If you want to force unauthenticated users elsewhere, change below.
    // Example: if (userLoaded && !user) router.push('/role-select')
  }, [user, userLoaded, router])

  const handleRoleSelect = async () => {
    // Allow selecting a role even if Clerk `user` isn't available yet
    // so the UI won't block on auth. Only block repeated clicks
      router.push(`/${userType}/dashboard`)
  }

  const handleRoleClick = async (roleKey: string) => {
    if (isUpdatingRole) return
    setIsUpdatingRole(true)
    setUserType(roleKey)
    // navigate immediately to the selected role's dashboard
    router.push(`/${roleKey}/dashboard`)
  }

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  const userTypes = [
    { 
      key: "patient", 
      icon: User, 
      label: t("patient"),
      description: t("patientRoleDesc"),
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      shadowColor: "shadow-blue-500/25"
    },
    { 
      key: "doctor", 
      icon: UserCheck, 
      label: t("doctor"),
      description: t("doctorRoleDesc"),
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      shadowColor: "shadow-emerald-500/25"
    },
    { 
      key: "police", 
      icon: Shield, 
      label: t("police"),
      description: t("policeRoleDesc"),
      gradient: "from-red-500 via-rose-600 to-pink-600",
      shadowColor: "shadow-red-500/25"
    },
  ]

  const backgroundIcons = [
    { Icon: Heart, delay: 0, duration: 8 },
    { Icon: Brain, delay: 1, duration: 10 },
    { Icon: Activity, delay: 2, duration: 12 },
    { Icon: Stethoscope, delay: 3, duration: 9 },
    { Icon: Plus, delay: 4, duration: 11 }
  ]

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="absolute top-4 left-4 z-20 flex items-center px-3 py-1.5 rounded-md bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-gray-700 shadow hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="font-medium text-gray-700 dark:text-gray-200">Sign Out</span>
      </button>
      
      {/* Dynamic Background with Mouse Interaction */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`
        }}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Medical Icons */}
        {backgroundIcons.map(({ Icon, delay, duration }, index) => (
          <div
            key={index}
            className="absolute opacity-5 dark:opacity-10"
            style={{
              left: `${10 + (index * 20)}%`,
              top: `${15 + (index * 15)}%`,
              animation: `floatSmooth ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          >
            <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        ))}
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-500" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-between items-center mx-20 mb-8">
            <Logo size="lg" className="text-gray-900 dark:text-white" isLanding={false} />
            <LanguageToggle />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please select your role to continue to your dashboard
          </p>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          {/* User Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
              {t("selectYourRole")}
            </h2>
            
            <div className="flex justify-center items-center gap-8 max-w-2xl mx-auto mb-10">
              {userTypes.map((type, index) => {
                const Icon = type.icon
                const isSelected = userType === type.key
                
                return (
                  <div
                    key={type.key}
                    className="relative cursor-pointer group"
                    onClick={() => handleRoleClick(type.key)}
                    style={{
                      animation: `morphIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                      animationDelay: `${index * 0.15}s`,
                      opacity: 0,
                      transform: 'scale(0.3) rotate(180deg)'
                    }}
                  >
                    {/* Magnetic Field Effect */}
                    <div className={`absolute -inset-8 rounded-full transition-all duration-700 ease-out ${
                      isSelected ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl scale-150' : ''
                    }`} />
                    
                    {/* Orbiting Ring */}
                    <div className={`absolute -inset-4 border-2 border-transparent rounded-full transition-all duration-500 ${
                      isSelected 
                        ? 'border-blue-400/40 animate-spin' 
                        : 'group-hover:border-gray-300/30 group-hover:animate-pulse'
                    }`} />
                    
                    {/* Main Card */}
                    <div className={`relative w-24 h-24 rounded-2xl shadow-lg transform transition-all duration-500 ease-out ${
                      isSelected 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110 shadow-2xl shadow-blue-500/40 rotate-0' 
                        : 'bg-white dark:bg-slate-800 hover:scale-105 hover:shadow-xl group-hover:-rotate-6'
                    } ${
                      !isSelected ? 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600' : ''
                    }`}>
                      
                      {/* Icon with Morphing Animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`transform transition-all duration-500 ${
                          isSelected 
                            ? 'scale-125 rotate-360' 
                            : 'group-hover:scale-110 group-hover:rotate-12'
                        }`}>
                          <Icon className={`w-8 h-8 transition-colors duration-300 ${
                            isSelected 
                              ? 'text-white' 
                              : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Ripple Effect */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl">
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping" />
                          <div className="absolute inset-2 bg-white/10 rounded-xl animate-pulse" />
                        </div>
                      )}
                      
                      {/* Particles */}
                      {isSelected && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-white/60 rounded-full"
                              style={{
                                top: '50%',
                                left: '50%',
                                animation: `particleFloat 2s linear infinite`,
                                animationDelay: `${i * 0.3}s`,
                                transform: `rotate(${i * 60}deg) translateX(40px)`
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* Label with Slide Animation */}
                    <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                      isSelected 
                        ? 'translate-y-0 opacity-100' 
                        : 'translate-y-2 opacity-70 group-hover:translate-y-0 group-hover:opacity-100'
                    }`}>
                      <div className={`text-sm font-medium text-center whitespace-nowrap px-3 py-1 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {type.label}
                      </div>
                    </div>
                    
                    {/* Holographic Overlay */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'group-hover:opacity-50'
                    }`} />
                  </div>
                )
              })}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleRoleSelect}
                disabled={isUpdatingRole}
                className="px-12 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingRole ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  `Continue as ${userTypes.find(type => type.key === userType)?.label}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Keyframes */}
      <style>{`
        @keyframes floatSmooth {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-10px) translateX(5px) rotate(90deg); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-5px) translateX(-5px) rotate(180deg); 
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-15px) translateX(3px) rotate(270deg); 
            opacity: 0.7;
          }
        }
        
        @keyframes morphIn {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(180deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateX(20px) scale(0);
          }
          50% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateX(40px) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateX(60px) scale(0);
          }
        }
        
        .rotate-360 {
          transform: rotate(360deg);
        }
      `}</style>
    </div>
  )
}
