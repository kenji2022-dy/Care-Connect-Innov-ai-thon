"use client"

import React, { useMemo, useState } from "react"
import { DoctorLayout } from "@/components/doctor/doctor-layout"
import VideoCard, { VideoItem } from "@/components/patient/VideoCard"
import { Button } from "@/components/ui/button"
import { useDoctorExp } from "@/components/exp/doctor-exp-context"

const SAMPLE_VIDEOS: VideoItem[] = [
{
  id: "d-v1",
  title: "Managing Post-op Pain Safely",
  category: "Guidelines",
  description: "Short tips on multimodal pain control and avoiding opioid misuse.",
  thumbUrl: "https://img.youtube.com/vi/SSR3OkJNTxM/hqdefault.jpg",
  embedUrl: "https://www.youtube.com/embed/SSR3OkJNTxM",
  xp: 0,
  postedBy: "Dr. A. Rao",
  postedByQualification: "MD Surgery",
},
{
  id: "d-v2",
  title: "Teleconsult Best Practices for Doctors",
  category: "Tips",
  description: "How to structure a safe, efficient teleconsult and document appropriately.",
  thumbUrl: "https://img.youtube.com/vi/8bMFL56Zflc/hqdefault.jpg",
  embedUrl: "https://www.youtube.com/embed/8bMFL56Zflc",
  xp: 0,
  postedBy: "Dr. S. Mehta",
  postedByQualification: "MBBS, DO",
},
{
  id: "d-v3",
  title: "Quick Stroke Assessment (FAST) Refresher",
  category: "Clinical",
  description: "Recognizing stroke early and routing for urgent imaging and thrombolysis.",
  thumbUrl: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3",
  embedUrl: "https://www.youtube.com/embed/60ItHLz5WEA",
  xp: 0,
  postedBy: "Dr. N. Kapoor",
  postedByQualification: "Neurologist",
},
{
  id: "d-v4",
  title: "Counselling Families in End-of-Life Care",
  category: "Communication",
  description: "Framework for compassionate conversations and shared decision making.",
  thumbUrl: "https://img.youtube.com/vi/8bMFL56Zflc/hqdefault.jpg",
  embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
  xp: 0,
  postedBy: "Dr. R. Iyer",
  postedByQualification: "Palliative Care",
},
{
  id: "d-v5",
  title: "Sepsis: Early Recognition in the ED",
  category: "Clinical",
  description: "Practical cues and early interventions to improve sepsis outcomes.",
  thumbUrl: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3",
  embedUrl: "https://www.youtube.com/embed/uelHwf8o7_U",
  xp: 0,
  postedBy: "Dr. K. Nair",
  postedByQualification: "Emergency Medicine",
},
{
  id: "d-v6",
  title: "Infection Control: PPE Tips",
  category: "Safety",
  description: "Practical donning/doffing workflow and common pitfalls.",
  thumbUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
  embedUrl: "https://www.youtube.com/embed/fJ9rUzIMcZQ",
  xp: 0,
  postedBy: "Dr. L. Gupta",
  postedByQualification: "Infection Control",
}


]

// Upload modal rendered inside DoctorLayout so it can call useDoctorExp()
function UploadModal(props: {
  draft: Partial<VideoItem> | null
  setDraft: (d: Partial<VideoItem> | null) => void
  onClose: () => void
  setVideos: (fn: (s: VideoItem[]) => VideoItem[]) => void
}) {
  const { draft, setDraft, onClose, setVideos } = props
  const { addExp } = useDoctorExp()

  // create a thumbnail data URL from an uploaded video file
  async function makeThumbnailFromFile(file: File) {
    return new Promise<string>((resolve) => {
      try {
        const url = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.src = url
        video.muted = true
        video.playsInline = true

        const cleanup = () => { try { URL.revokeObjectURL(url) } catch {} }

        const handle = () => {
          try {
            const w = video.videoWidth || 640
            const h = video.videoHeight || 360
            const canvas = document.createElement('canvas')
            canvas.width = Math.min(640, w)
            canvas.height = Math.min(360, h)
            const ctx = canvas.getContext('2d')
            if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const data = canvas.toDataURL('image/jpeg', 0.75)
            cleanup()
            resolve(data)
          } catch (e) {
            cleanup()
            resolve('')
          }
        }

        video.addEventListener('loadeddata', handle, { once: true })
        // fallback if loadeddata doesn't fire quickly
        setTimeout(() => {
          if (video.readyState >= 2) handle()
        }, 1200)
      } catch (e) {
        resolve('')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Upload Video</h2>
          <button onClick={onClose} className="text-sm px-3 py-1 bg-gray-100 rounded">Close</button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full mt-1 p-2 border rounded" value={draft?.title || ""} onChange={(e) => setDraft({ ...(draft || {}), title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <textarea className="w-full mt-1 p-2 border rounded" value={draft?.description || ""} onChange={(e) => setDraft({ ...(draft || {}), description: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">YouTube Embed URL (or direct link)</label>
            <input className="w-full mt-1 p-2 border rounded" value={draft?.embedUrl || ""} onChange={(e) => setDraft({ ...(draft || {}), embedUrl: e.target.value })} placeholder="https://www.youtube.com/embed/VIDEO_ID or https://youtu.be/VIDEO_ID" />
          </div>
          <div>
            <label className="text-sm">Or upload a local video file</label>
            <input
              type="file"
              accept="video/*"
              className="w-full mt-1"
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0]
                if (!file) return
                const obj = URL.createObjectURL(file)
                setDraft({ ...(draft || {}), embedUrl: obj, title: draft?.title || file.name })
                const thumb = await makeThumbnailFromFile(file)
                if (thumb) setDraft((d) => ({ ...(d || {}), thumbUrl: thumb }))
              }}
            />
            <div className="text-xs text-gray-500 mt-1">Uploading locally stores the video in-browser (client-only). For persistence, add a server upload later.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => {
              const id = 'upload-' + Date.now()
              const newVideo: VideoItem = {
                id,
                title: draft?.title || 'Untitled',
                category: (draft as any)?.category || 'Uploaded',
                description: draft?.description || '',
                thumbUrl: (draft as any)?.thumbUrl || 'https://images.unsplash.com/photo-1587502536263-3b2a1f6c9b7b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b3c4d5e6f',
                embedUrl: draft?.embedUrl || '',
                xp: (draft as any)?.xp || 0,
                postedBy: draft?.postedBy || 'You',
                postedByQualification: (draft as any)?.postedByQualification || ''
              }
              setVideos((s) => [newVideo, ...s])
              // Award doctor 2 XP for uploading a video
              try { addExp(2, 'doctor:upload_video', { videoId: id, title: newVideo.title }) } catch {}
              onClose()
              setDraft(null)
            }}>Save & Publish</Button>
            <Button variant="outline" onClick={() => { onClose(); setDraft(null) }}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorResourcesPage() {
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>(SAMPLE_VIDEOS)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [draft, setDraft] = useState<Partial<VideoItem> | null>(null)

  const recent = useMemo(() => videos.slice(0, 5), [videos])
  const previous = useMemo(() => videos.slice(5), [videos])

  const play = (v: VideoItem) => setSelected(v)
  const close = () => setSelected(null)

  const iframeSrc = (base?: string | null) => {
    const fallback = "https://www.youtube.com/embed/3fumBcKC6RE"
    const srcBase = base || fallback
    try {
      const url = new URL(srcBase)
      const params = url.searchParams
      if (!params.has("autoplay")) params.set("autoplay", "1")
      if (!params.has("mute") && !params.has("muted")) params.set("mute", "1")
      return url.toString()
    } catch (e) {
      return srcBase + (srcBase.includes("?") ? "&" : "?") + "autoplay=1&mute=1"
    }
  }

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto p-4 mt-16"> {/* offset for sticky header */}
        {/* Upload area */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Resources</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Recently posted videos and earlier posts for clinicians.</p>
          </div>
          <div>
            <Button onClick={() => { setDraft({}); setUploadOpen(true) }}>
              Upload Video
            </Button>
          </div>
        </div>

        {/* Upload modal rendered inside provider */}
        {uploadOpen && (
          <UploadModal draft={draft} setDraft={setDraft} onClose={() => setUploadOpen(false)} setVideos={(fn) => setVideos(fn)} />
        )}

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-3">Recently posted videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={play} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Previous posts</h2>
          {previous.length === 0 ? (
            <div className="text-sm text-gray-500">No earlier posts.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {previous.map((v) => (
                <VideoCard key={v.id} video={v} onPlay={play} />
              ))}
            </div>
          )}
        </section>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium">{selected.title}</h2>
                <button onClick={close} className="text-sm px-3 py-1 bg-gray-100 rounded">Close</button>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                {selected.embedUrl && (selected.embedUrl.startsWith('blob:') || /\.(mp4|webm|ogg)$/i.test(selected.embedUrl)) ? (
                  <video src={selected.embedUrl} controls className="w-full h-[500px] bg-black" />
                ) : (
                  <iframe
                    src={iframeSrc(selected.embedUrl)}
                    title={selected.title}
                    width={960}
                    height={540}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[500px] border-0"
                  />
                )}
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-gray-300">{selected.description}</div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
