"use client"

import { PatientLayout } from "@/components/patient/patient-layout"
import { useState, useEffect } from "react"
import { Loader2, Activity, Heart } from "lucide-react"

export default function SimulationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showIframe, setShowIframe] = useState(false)

  useEffect(() => {
    // Start loading the iframe in the background after component mounts
    const timer = setTimeout(() => {
      setShowIframe(true)
    }, 100) // Small delay to ensure smooth transition

    // Show the iframe after 5 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadingTimer)
    }
  }, [])

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Health Simulation - Eating and Exercise
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive simulation to understand the relationship between eating habits and exercise.
          </p>
          
          <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
            {/* Hidden iframe loading in background */}
            <iframe 
                src="https://phet.colorado.edu/sims/cheerpj/eating-and-exercise/latest/eating-and-exercise.html?simulation=eating-and-exercise"
                width="100%"
                height="1000"
                className={`w-full rounded border transition-opacity duration-500 ${
                    isLoading ? 'opacity-0 absolute inset-0' : 'opacity-100'
                }`}
                allowFullScreen
                title="Eating and Exercise Simulation"
            />

            {/* Loading overlay with blur effect */}
            {isLoading && (
              <div className="relative inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg flex items-center justify-center z-10">
                <div className="text-center p-2">
                  {/* Animated loader */}
                  <div className="relative my-1">
                    <div className="w-20 h-20 mx-auto relative">
                      <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-blue-700 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Loading text with animation */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Loading Health Simulation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Preparing your interactive experience...
                    </p>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-6 w-48 mx-auto">
                    <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  {/* Health themed icons */}
                  <div className="flex justify-center space-x-4 mt-6 opacity-60">
                    <Heart className="w-5 h-5 text-red-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <Activity className="w-5 h-5 text-green-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Heart className="w-5 h-5 text-red-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to use this simulation:
            </h2>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
              <li>• Adjust daily calorie intake and exercise levels</li>
              <li>• Observe changes in body weight over time</li>
              <li>• Learn about energy balance and metabolism</li>
              <li>• Experiment with different scenarios to understand health impacts</li>
            </ul>
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}