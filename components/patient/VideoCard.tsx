"use client"

import React from "react"
import { useExp } from "@/components/exp/exp-context"
import { User2 } from "lucide-react"

export type VideoItem = {
  id: string
  title: string
  category: string
  description: string
  thumbUrl: string
  embedUrl: string
  xp?: number
  postedBy?: string
  postedByQualification?: string
}

type Props = {
  video: VideoItem
  onPlay: (video: VideoItem) => void
}

export const VideoCard: React.FC<Props> = ({ video, onPlay }) => {
  let allowed = true
  try {
    const { exp } = useExp()
    if (typeof video.xp === "number") allowed = exp >= video.xp
  } catch (e) {
    if (typeof video.xp === "number") allowed = false
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      <div className="relative">
        <img src={video.thumbUrl} alt={video.title} className="w-full h-40 object-cover" />
        <div className={`absolute inset-0 flex items-center justify-center ${allowed ? 'bg-black bg-opacity-25 opacity-0 hover:opacity-100 transition-opacity' : 'bg-black/50'}`}>
          {allowed ? (
            <button
              onClick={() => onPlay(video)}
              aria-label={`Play ${video.title}`}
            >
              <div className="bg-white rounded-full p-2 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          ) : (
            <div className="text-white text-sm bg-black/30 rounded px-3 py-1">Locked (requires {video.xp ?? 0} XP)</div>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium truncate">{video.title}</h3>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{video.category}</span>
        </div>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{video.description}</p>
        <div className="mt-3 flex justify-between">
          <div className="flex justify-center">
            <User2 className="h-4 w-4 mr-1 text-gray-600" />
            <div className="text-xs text-gray-800">
              <div className="text-sm bold">{video.postedBy}</div>
              <div className="italic">{video.postedByQualification}</div>
            </div>  
          </div>
          <button
            onClick={() => allowed && onPlay(video)}
            className={`px-3 py-1 text-sm rounded ${allowed ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={!allowed}
          >
            {allowed ? 'Play' : `Locked (${video.xp ?? 0} XP)`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
