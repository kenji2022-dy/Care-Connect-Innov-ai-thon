"use client"

import { useSession } from '@/hooks/use-session'
import { SessionDebug } from '@/components/debug/session-debug'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  const session = useSession()
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p>If you can see this, the routing is working.</p>
        
        {/* Session Status */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          <div className="space-y-2 text-sm">
            <p>Has Valid Session: {session.hasValidSession ? '✅ Yes' : '❌ No'}</p>
            <p>Is Signed In: {session.isSignedIn ? '✅ Yes' : '❌ No'}</p>
            <p>User Role: {session.userRole || 'Not selected'}</p>
            <p>Loading: {session.isLoading ? '⏳ Yes' : '✅ Complete'}</p>
          </div>
          <Button 
            onClick={session.logSessionInfo}
            className="mt-3"
            variant="outline"
            size="sm"
          >
            Log Session Details
          </Button>
        </div>
        
        <div className="mt-4">
          <a href="/patient/dashboard" className="text-blue-600 hover:underline mr-4">
            Patient Dashboard
          </a>
          <a href="/doctor/dashboard" className="text-blue-600 hover:underline mr-4">
            Doctor Dashboard
          </a>
          <a href="/police/dashboard" className="text-blue-600 hover:underline">
            Police Dashboard
          </a>
        </div>
      </div>
      
      {/* Debug Panel */}
      <SessionDebug showInProduction={true} />
    </div>
  )
}
