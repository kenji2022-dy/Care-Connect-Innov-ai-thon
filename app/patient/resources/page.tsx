"use client"

import React, { useMemo, useState } from "react"
import { PatientLayout } from "@/components/patient/patient-layout"
import VideoCard, { VideoItem } from "@/components/patient/VideoCard"

const SAMPLE_VIDEOS: VideoItem[] = [
{
  id: "v1",
  title: "Knee Care: Simple Strengthening Exercises",
  category: "How-tos",
  description: "Gentle home exercises to strengthen muscles around the knee joint.",
  thumbUrl: "https://plus.unsplash.com/premium_photo-1723795495215-5690f94379d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",  // physio knee
  embedUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8",
  xp: 0,
  postedBy: "Anjali Sharma",
  postedByQualification: "Physiotherapist, MS Ortho Rehab",
},
{
  id: "v2",
  title: "Daily Breathing Exercises for Stress",
  category: "Tips",
  description: "Short breathing routines you can do anytime to reduce anxiety and improve focus.",
  thumbUrl: "https://plus.unsplash.com/premium_photo-1734360487444-c23ac9d1356e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",  // placeholder physio – replace with better breathing image if desired
  embedUrl: "https://www.youtube.com/embed/1vx8iUvfyCY",
  xp: 10,
  postedBy: "Dr. Rohan Mehta",
  postedByQualification: "Pulmonologist, MD Respiratory Medicine",
},
{
  id: "v3",
  title: "How to Use an Inhaler Correctly",
  category: "How-tos",
  description: "Step-by-step demo to ensure effective medication delivery for asthma inhalers.",
  thumbUrl: "https://images.unsplash.com/photo-1645273474732-40e757681b97?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",  // inhaler image
  embedUrl: "https://www.youtube.com/embed/gz5Qf6yYp5s",
  xp: 20,
  postedBy: "Dr. Nidhi Kulkarni",
  postedByQualification: "Allergist & Asthma Specialist, MD Pulmonology",
},
{
  id: "v4",
  title: "Preventing Falls at Home",
  category: "Health Cautions",
  description: "Practical tips to reduce trip hazards and keep loved ones safe at home.",
  thumbUrl: "https://media.istockphoto.com/id/1383512710/photo/caregiver-help-asian-or-elderly-old-woman-walk-with-walker-support-up-the-stairs-in-home.webp?a=1&b=1&s=612x612&w=0&k=20&c=Aza_oRsJfiUVplSI59wRth5Pqdb8x7RmiKjAPXA8WX0=",  // example elderly care/falls image
  embedUrl: "https://www.youtube.com/embed/7s2eZgXq3Nw",
  xp: 30,
  postedBy: "Sujata Rao",
  postedByQualification: "Geriatric Care Specialist, BSc Nursing",
},
{
  id: "v5",
  title: "Healthy Eating: Simple Plate Tips",
  category: "Tips",
  description: "Create balanced meals quickly using visual plate guidelines and swaps.",
  thumbUrl: "https://plus.unsplash.com/premium_photo-1677654308800-a4b0afa81e06?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",  // healthy plate
  embedUrl: "https://www.youtube.com/embed/1x1x1x1x1x1",
  xp: 100,
  postedBy: "Dr. Karan Verma",
  postedByQualification: "Clinical Nutritionist, M.Sc Food Science",
},
{
  id: "v6",
  title: "Recognizing Signs of Dehydration",
  category: "Health Cautions",
  description: "How to spot dehydration early and what first-aid steps to take at home.",
  thumbUrl: "https://plus.unsplash.com/premium_photo-1689298468802-5c2cfb626971?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",  // hydration concept
  embedUrl: "https://www.youtube.com/embed/1roy4o4tqQM",
  xp: 90,
  postedBy: "Dr. Meera Iyer",
  postedByQualification: "Emergency Medicine Specialist, MBBS, MD EM",
}


]

export default function PatientResourcesPage() {
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const [filter, setFilter] = useState<string>("All")

  const categories = useMemo(() => {
    const set = new Set<string>(SAMPLE_VIDEOS.map((v) => v.category))
    return ["All", ...Array.from(set)]
  }, [])

  const filtered = useMemo(() => {
    if (filter === "All") return SAMPLE_VIDEOS
    return SAMPLE_VIDEOS.filter((v) => v.category === filter)
  }, [filter])

  const play = (v: VideoItem) => setSelected(v)
  const close = () => setSelected(null)

  // Add a simple iframe builder that ensures autoplay/mute for consistent playback
  const iframeSrc = (base?: string | null) => {
    const fallback = "https://www.youtube.com/embed/gC_L9qAHVJ8"
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
    <PatientLayout>
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Helpful videos about health cautions, tips, and how-to guides.</p>
        </header>

        <div className="mb-4 flex items-center gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded text-sm ${filter === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={play} />
          ))}
        </section>

        {/* Modal/Overlay player */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium">{selected.title}</h2>
                <button onClick={close} className="text-sm px-3 py-1 bg-gray-100 rounded">Close</button>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={iframeSrc(selected.embedUrl)}
                  title={selected.title}
                  width={960}
                  height={540}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[500px] border-0"
                />
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-gray-300">{selected.description}</div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  )
}
