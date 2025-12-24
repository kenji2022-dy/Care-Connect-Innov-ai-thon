"use client"

import React, { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Video } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useSession } from "@/hooks/use-session"

// Simple in-app WebRTC call widget adapted from the demo `f/index.html`.
// Uses a public signaling server by default (rtc-server-wbq3.onrender.com). You can replace
// the URL with your own signaling server if you run `WebRtc/b/index.js`.

const SIGNALING_SERVER = "https://rtc-server-wbq3.onrender.com"

export default function CallWidget() {
  const myVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const [socket, setSocket] = useState<any>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [userId, setUserId] = useState("")
  const [friendId, setFriendId] = useState("")
  const [registered, setRegistered] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const searchParams = useSearchParams()
  const session = useSession()

  useEffect(() => {
    const s = io(SIGNALING_SERVER)
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  // Prefill friend from query param (e.g., /webrtc?friend=Dr%20Ananya%20Mehta)
  useEffect(() => {
    const friend = searchParams?.get("friend")
    if (friend) {
      try {
        setFriendId(decodeURIComponent(friend))
      } catch {
        setFriendId(friend)
      }
    }
  }, [searchParams])

  // Auto-register authenticated user if available
  useEffect(() => {
    if (!session) return
    if (session.isSignedIn && session.userId) {
      setUserId(session.userId)
    }
  }, [session])

  useEffect(() => {
    // getUserMedia on mount
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream)
        if (myVideoRef.current) myVideoRef.current.srcObject = stream
      })
      .catch((err) => console.error("Error accessing media devices:", err))
  }, [])

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  }

  useEffect(() => {
    if (!socket) return

    socket.on("incoming-call", ({ from, offer }: any) => {
      const pc = new RTCPeerConnection(config)
      setPeerConnection(pc)

      if (localStream) {
        localStream.getTracks().forEach((t) => pc.addTrack(t, localStream))
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { to: from, candidate: event.candidate })
        }
      }

      pc.ontrack = (event) => {
        if (userVideoRef.current) userVideoRef.current.srcObject = event.streams[0]
      }

      pc
        .setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => pc.createAnswer())
        .then((answer) => {
          pc.setLocalDescription(answer)
          socket.emit("answer-call", { from: userId || "", to: from, answer })
        })
        .catch((err) => console.error(err))
    })

    socket.on("call-answered", ({ answer }: any) => {
      if (peerConnection) peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    })

    socket.on("ice-candidate", ({ candidate }: any) => {
      if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    })

    socket.on("call-ended", () => {
      if (peerConnection) {
        peerConnection.close()
        setPeerConnection(null)
      }
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop())
        setLocalStream(null)
      }
      if (userVideoRef.current) userVideoRef.current.srcObject = null
      // allow user to reinitialize media if needed
    })

    // When socket connects, if we have a userId and not registered, auto-register
    socket.on("connect", () => {
      if (userId && !registered) {
        socket.emit("register-user", userId)
        setRegistered(true)
      }
    })

    return () => {
      socket.off("incoming-call")
      socket.off("call-answered")
      socket.off("ice-candidate")
      socket.off("call-ended")
      socket.off("connect")
    }
  }, [socket, localStream, peerConnection, userId])

  const registerUser = () => {
    if (!socket) return
    if (!userId) return alert("Please enter a valid user ID to register")
    socket.emit("register-user", userId)
    setRegistered(true)
    alert("User registered successfully!")
  }

  const startCall = async () => {
    if (!socket) return
    if (!friendId) return alert("Please enter friend's user ID")

    setConnecting(true)
    const pc = new RTCPeerConnection(config)
    setPeerConnection(pc)

    if (localStream) localStream.getTracks().forEach((t) => pc.addTrack(t, localStream))

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit("ice-candidate", { to: friendId, candidate: event.candidate })
    }

    pc.ontrack = (event) => {
      if (userVideoRef.current) userVideoRef.current.srcObject = event.streams[0]
    }

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit("start-call", { from: userId || "", to: friendId, offer })
    } catch (err) {
      console.error(err)
    } finally {
      setConnecting(false)
    }
  }

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop())
      setLocalStream(null)
    }
    if (userVideoRef.current) userVideoRef.current.srcObject = null
    if (socket && friendId) socket.emit("end-call", { to: friendId })
    alert("Call ended")
  }
  return (
    <Card className="max-w-full mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>In-app Video Call</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={registered ? "default" : "secondary"}>{registered ? "Registered" : "Not registered"}</Badge>
            <Badge variant={connecting ? "outline" : "secondary"}>{connecting ? "Connecting..." : "Idle"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <video ref={myVideoRef} autoPlay muted className="w-full md:w-1/2 border" />
          <video ref={userVideoRef} autoPlay className="w-full md:w-1/2 border" />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="col-span-1 md:col-span-1">
            <label className="text-sm text-muted-foreground">Your User ID</label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Your User ID" />
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="text-sm text-muted-foreground">Call To</label>
            <Input value={friendId} onChange={(e) => setFriendId(e.target.value)} placeholder="Friend's User ID or Name" />
          </div>

          <div className="col-span-1 md:col-span-1 flex items-end space-x-2">
            <Button variant="default" onClick={registerUser} disabled={registered}>
              <Badge className="mr-2">
                <Phone className="h-4 w-4" />
              </Badge>
              Register
            </Button>
            <Button variant="outline" onClick={startCall} disabled={!localStream || !friendId || connecting}>
              <Video className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="secondary" onClick={endCall}>
              End
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Note: Uses a public signaling server by default. For production, host your own signaling server
          (see WebRtc/b/index.js) and replace SIGNALING_SERVER in the component.
        </p>
      </CardContent>
    </Card>
  )
}
