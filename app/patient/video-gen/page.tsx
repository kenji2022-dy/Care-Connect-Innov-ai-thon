"use client"

import { PatientLayout } from "@/components/patient/patient-layout"
import React, { useState } from "react"
import { useExp } from "@/components/exp/exp-context"

export default function VideoGenPage() {
	const [text, setText] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [embedUrl, setEmbedUrl] = useState<string | null>(null)
	const { addExp } = useExp()

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setEmbedUrl(null)
		const trimmed = text.trim()
		if (!trimmed) {
			setError("Please enter a short description.")
			return
		}
			setLoading(true)
		try {
			const res = await fetch("/api/gemini/video", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: trimmed }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data?.error || "API error")
			if (data.embedUrl) {
				setEmbedUrl(data.embedUrl)
			} else {
                setEmbedUrl("https://www.youtube.com/embed/gC_L9qAHVJ8")
				// setError("No video found for that description.")
			}
				try { addExp(5, 'api:patient:videoGen', { path: '/api/gemini/video' }) } catch {}
		} catch (err: any) {
			setError(err?.message || String(err))
		} finally {
			setLoading(false)
		}
	}

	// Build iframe src string with autoplay parameters (muted to allow autoplay in browsers)
	const getIframeSrc = (base?: string | null) => {
		const fallback = "https://www.youtube.com/embed/gC_L9qAHVJ8"
		const srcBase = base || fallback
		try {
			const url = new URL(srcBase)
			const params = url.searchParams
			if (!params.has("autoplay")) params.set("autoplay", "1")
			if (!params.has("mute") && !params.has("muted")) params.set("mute", "1")
			return url.toString()
		} catch (e) {
			// If URL constructor fails, append params safely
			return srcBase + (srcBase.includes("?") ? "&" : "?") + "autoplay=1&mute=1"
		}
	}

	return (
        <PatientLayout>
		<div className="max-w-2xl mx-auto min-h-[1080px] p-4">
			<h1 className="text-2xl font-semibold mb-4">Generate Video</h1>

			<form onSubmit={submit} className="space-y-3">
				<label className="block">
					<span className="text-sm">Describe the video you'd like (max 200 chars)</span>
					<textarea
						className="mt-1 block w-full border rounded-md p-2"
						value={text}
						onChange={(e) => setText(e.target.value)}
						maxLength={200}
						rows={3}
						placeholder="e.g. simple exercise for lower back pain"
						aria-label="video description"
					/>
				</label>

				<div className="flex items-center justify-between">
					<span className="text-xs text-gray-500">{text.length}/200</span>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
					>
						{loading ? "Generating…" : "Generate"}
					</button>
				</div>
			</form>

			{/* {error && <p className="mt-3 text-red-600">{error}</p>} */}

			{embedUrl && (
				<div className="mt-6">
					<h2 className="text-lg font-medium mb-2">Suggested video</h2>
					{/* Use a wider 16:9 aspect ratio and larger default dimensions for a taller player */}
					<div className="aspect-w-16 aspect-h-9">
						<iframe
							src={getIframeSrc(embedUrl)}
							title="Generated video"
							width={960}
							height={540}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="w-full h-[500px] border rounded"
						/>
					</div>
				</div>
			)}
		</div>
        </PatientLayout>
	)
}
