"use client"
import { useSession } from '@/hooks/use-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SessionDebugProps {
  showInProduction?: boolean
}

export function SessionDebug({ showInProduction = false }: SessionDebugProps) {
  const session = useSession()
  
  // Hide in production unless explicitly shown
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null
  }
  
  const sessionInfo = session.getSessionInfo()
  
  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-slate-100 dark:bg-slate-800 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Session Debug
          <Badge variant={session.hasValidSession ? "default" : "destructive"}>
            {session.hasValidSession ? "Active" : "Invalid"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-1">
          <span className="font-medium">User ID:</span>
          <span className="truncate">{sessionInfo.userId}</span>
          
          <span className="font-medium">Session ID:</span>
          <span className="truncate">{sessionInfo.sessionId}</span>
          
          <span className="font-medium">Signed In:</span>
          <span>{sessionInfo.isSignedIn ? '✅' : '❌'}</span>
          
          <span className="font-medium">Role:</span>
          <span>{sessionInfo.userRole || 'Not set'}</span>
          
          <span className="font-medium">Email:</span>
          <span className="truncate">{sessionInfo.email || 'N/A'}</span>
        </div>
        
        <div className="pt-2 border-t">
          <Button 
            onClick={session.logSessionInfo}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Log Full Session Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
