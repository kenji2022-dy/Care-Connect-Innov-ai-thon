"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Filter,
  Search,
  Ambulance,
  Download,
  Wifi,
  WifiOff,
  Route,
  Building,
  TestTube,
  Pill,
} from "lucide-react"
import { PatientLayout } from "@/components/patient/patient-layout"
import { useLanguage } from "@/components/language/language-provider"
import { usePWA } from "@/components/pwa/pwa-provider"
import { toast } from "@/hooks/use-toast"
import { fetchDirectionsORS } from "@/lib/utils"

interface HospitalData {
  id: string
  type: string
  name: string
  address: string
  phone: string
  distance: number
  rating: number
  specialties: string[]
  emergencyServices: boolean
  availability: "open" | "closed" | "emergency-only"
  coordinates: {
    lat: number
    lng: number
  }
  waitTime?: string
  beds?: {
    total: number
    available: number
  } | null
  lastUpdated?: string
}

interface OfflineRoute {
  distance: number
  duration: number
  instructions: string[]
  coordinates: [number, number][]
}

export default function HospitalsPage() {
  const { t } = useLanguage()
  const { isOffline } = usePWA()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [sortBy, setSortBy] = useState("distance")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [offlineMapReady, setOfflineMapReady] = useState(false)
  const [downloadingMaps, setDownloadingMaps] = useState(false)
  const [cachedHospitals, setCachedHospitals] = useState<HospitalData[]>([])
  const [selectedRoute, setSelectedRoute] = useState<OfflineRoute | null>(null)
  const [showOfflineRoute, setShowOfflineRoute] = useState(false)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [filterType, setFilterType] = useState("all")

  // Enhanced hospital data with offline capabilities - Telangana Hospitals
  const mockHospitals: HospitalData[] = [
    // HYDERABAD
    {
      id: "1",
      type: "hospital",
      name: "Apollo Hospitals Hyderabad",
      address: "Jubilee Hills, Hyderabad, Telangana",
      phone: "+91-40-2360-7777",
      distance: 1.5,
      rating: 4.7,
      specialties: ["Cardiology", "Neurology", "Emergency"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4239, lng: 78.4483 },
      waitTime: "20 mins",
      beds: { total: 500, available: 60 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "2",
      type: "hospital",
      name: "Yashoda Hospitals Secunderabad",
      address: "Alexander Road, Hyderabad, Telangana",
      phone: "+91-40-2771-3333",
      distance: 3.2,
      rating: 4.5,
      specialties: ["Oncology", "Cardiology", "Emergency"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4411, lng: 78.4867 },
      waitTime: "15 mins",
      beds: { total: 450, available: 40 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "3",
      type: "hospital",
      name: "Rainbow Children's Hospital",
      address: "Banjara Hills, Hyderabad, Telangana",
      phone: "+91-40-4466-9999",
      distance: 2.5,
      rating: 4.6,
      specialties: ["Pediatrics", "Neonatology", "Emergency"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4156, lng: 78.4378 },
      waitTime: "10 mins",
      beds: { total: 200, available: 25 },
      lastUpdated: new Date().toISOString(),
    },

    // KHAMMAM
    {
      id: "4",
      type: "hospital",
      name: "MGM Hospital Khammam",
      address: "Yellandu Cross Road, Khammam, Telangana",
      phone: "+91-8742-255344",
      distance: 2.3,
      rating: 4.3,
      specialties: ["General Medicine", "Emergency", "Surgery"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.2473, lng: 80.1514 },
      waitTime: "10 mins",
      beds: { total: 300, available: 35 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "5",
      type: "hospital",
      name: "Sree Venkateshwara Hospital",
      address: "Wyra Road, Khammam, Telangana",
      phone: "+91-8742-274511",
      distance: 1.9,
      rating: 4.0,
      specialties: ["Orthopedics", "Gynecology"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.2528, lng: 80.1483 },
      waitTime: "12 mins",
      beds: { total: 120, available: 18 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "6",
      type: "hospital",
      name: "Prashanthi Hospital",
      address: "Kothagudem Road, Khammam, Telangana",
      phone: "+91-8742-289000",
      distance: 2.6,
      rating: 4.1,
      specialties: ["Diabetology", "Cardiology"],
      emergencyServices: true,
      availability: "emergency-only",
      coordinates: { lat: 17.2469, lng: 80.157 },
      waitTime: "7 mins",
      beds: { total: 100, available: 15 },
      lastUpdated: new Date().toISOString(),
    },

    // NIZAMABAD
    {
      id: "7",
      type: "hospital",
      name: "Care Hospital Nizamabad",
      address: "Bodhan Road, Nizamabad, Telangana",
      phone: "+91-8462-224477",
      distance: 1.8,
      rating: 4.1,
      specialties: ["Orthopedics", "Gynecology", "Emergency"],
      emergencyServices: true,
      availability: "emergency-only",
      coordinates: { lat: 18.6725, lng: 78.0941 },
      waitTime: "8 mins",
      beds: { total: 150, available: 20 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "8",
      type: "hospital",
      name: "Sunshine Hospital Nizamabad",
      address: "Armoor Road, Nizamabad, Telangana",
      phone: "+91-8462-233344",
      distance: 2.0,
      rating: 4.2,
      specialties: ["General Medicine", "Surgery", "Pediatrics"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 18.6789, lng: 78.1021 },
      waitTime: "9 mins",
      beds: { total: 180, available: 30 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "9",
      type: "hospital",
      name: "Life Care Hospital",
      address: "Tilak Garden, Nizamabad, Telangana",
      phone: "+91-8462-225566",
      distance: 2.4,
      rating: 4.0,
      specialties: ["ENT", "Orthopedics"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 18.6695, lng: 78.0918 },
      waitTime: "11 mins",
      beds: { total: 90, available: 12 },
      lastUpdated: new Date().toISOString(),
    },

    {
      id: "10",
      type: "diagnostic",
      name: "Lucid Diagnostics Hyderabad",
      address: "Himayatnagar, Hyderabad, Telangana",
      phone: "+91-40-4444-4444",
      distance: 2.1,
      rating: 4.3,
      specialties: ["Blood Test", "MRI", "CT Scan"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.3951, lng: 78.4867 },
      waitTime: "5 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },

    {
      id: "11",
      type: "diagnostic",
      name: "Vijaya Diagnostic Centre",
      address: "Nehru Nagar, Khammam, Telangana",
      phone: "+91-8742-333222",
      distance: 1.2,
      rating: 4.2,
      specialties: ["X-Ray", "Ultrasound", "Blood Test"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.2553, lng: 80.1487 },
      waitTime: "7 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },

    {
      id: "12",
      type: "diagnostic",
      name: "MedPlus Diagnostics Nizamabad",
      address: "Subhash Nagar, Nizamabad, Telangana",
      phone: "+91-8462-555666",
      distance: 1.6,
      rating: 4.4,
      specialties: ["ECG", "Blood Test", "Thyroid Profile"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 18.6709, lng: 78.0932 },
      waitTime: "6 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "13",
      type: "diagnostic",
      name: "Lucid Medical Diagnostics",
      address: "Banjara Hills, Hyderabad, Telangana",
      phone: "+91-40-6606-6606",
      distance: 2.1,
      rating: 4.6,
      specialties: ["MRI", "CT Scan", "Ultrasound", "Blood Test"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4191, lng: 78.4483 },
      waitTime: "5 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "14",
      type: "diagnostic",
      name: "Medall Diagnostics",
      address: "Kukatpally, Hyderabad, Telangana",
      phone: "+91-40-2306-3456",
      distance: 3.0,
      rating: 4.3,
      specialties: ["X-Ray", "ECG", "Diabetes Test", "Lipid Profile"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.4935, lng: 78.3996 },
      waitTime: "8 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "15",
      type: "diagnostic",
      name: "Vijaya Diagnostic Centre",
      address: "Himayatnagar, Hyderabad, Telangana",
      phone: "+91-40-2340-2340",
      distance: 2.7,
      rating: 4.7,
      specialties: ["Blood Test", "MRI", "Pathology", "COVID-19 RT-PCR"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.3961, lng: 78.4867 },
      waitTime: "4 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "16",
      type: "diagnostic",
      name: "Elbit Medical Diagnostics",
      address: "Ameerpet, Hyderabad, Telangana",
      phone: "+91-40-2373-5555",
      distance: 2.4,
      rating: 4.5,
      specialties: ["CT Scan", "Ultrasound", "Blood Tests"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.4375, lng: 78.4483 },
      waitTime: "7 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "17",
      type: "diagnostic",
      name: "Tesla Diagnostics",
      address: "Madhapur, Hyderabad, Telangana",
      phone: "+91-40-2311-0022",
      distance: 3.2,
      rating: 4.6,
      specialties: ["MRI", "PET Scan", "Mammography", "Blood Tests"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4412, lng: 78.3915 },
      waitTime: "6 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "18",
      type: "pharmacy",
      name: "MedPlus Pharmacy Banjara Hills",
      address: "Road No. 12, Banjara Hills, Hyderabad, Telangana",
      phone: "+91-40-6700-0300",
      distance: 1.9,
      rating: 4.5,
      specialties: ["Prescription Medicines", "Health Supplements", "First Aid"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4123, lng: 78.4372 },
      waitTime: "2 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "19",
      type: "pharmacy",
      name: "Apollo Pharmacy Madhapur",
      address: "Near Image Hospital, Madhapur, Hyderabad, Telangana",
      phone: "+91-40-2355-1000",
      distance: 2.6,
      rating: 4.4,
      specialties: ["Prescription Drugs", "OTC Products", "Baby Care"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.4489, lng: 78.3915 },
      waitTime: "3 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "20",
      type: "pharmacy",
      name: "Netmeds Store Ameerpet",
      address: "Ameerpet Main Road, Hyderabad, Telangana",
      phone: "+91-40-4000-4000",
      distance: 2.2,
      rating: 4.3,
      specialties: ["Generic Medicines", "Healthcare Devices", "Skin Care"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.4376, lng: 78.4482 },
      waitTime: "4 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "21",
      type: "pharmacy",
      name: "1mg Pharmacy Begumpet",
      address: "Opposite Lifestyle, Begumpet, Hyderabad, Telangana",
      phone: "+91-40-6666-1111",
      distance: 3.1,
      rating: 4.2,
      specialties: ["Prescription Drugs", "Wellness Products", "Homeopathy"],
      emergencyServices: false,
      availability: "open",
      coordinates: { lat: 17.4438, lng: 78.4623 },
      waitTime: "5 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "22",
      type: "pharmacy",
      name: "Practo Pharmacy Himayatnagar",
      address: "Main Road, Himayatnagar, Hyderabad, Telangana",
      phone: "+91-40-4444-8888",
      distance: 2.8,
      rating: 4.4,
      specialties: ["Prescription Medicines", "Diabetic Care", "Vaccines"],
      emergencyServices: true,
      availability: "open",
      coordinates: { lat: 17.3986, lng: 78.4782 },
      waitTime: "2 mins",
      beds: null,
      lastUpdated: new Date().toISOString(),
    },
    

  ]

  // Place filteredHospitals here, after mockHospitals and cachedHospitals are defined
  const filteredHospitals = (isOffline ? cachedHospitals : mockHospitals)
    .filter((hospital) => {
      const matchesType = filterType === "all" || hospital.type === filterType
      const matchesSearch =
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialty =
        filterSpecialty === "all" ||
        hospital.specialties.some((s) => s.toLowerCase().includes(filterSpecialty.toLowerCase()))
      return matchesType && matchesSearch && matchesSpecialty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.distance - b.distance
        case "rating":
          return b.rating - a.rating
        case "availability":
          return a.beds ? (b.beds?.available || 0) - a.beds.available : 0
        default:
          return 0
      }
    })

  useEffect(() => {
    initializeOfflineData()
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      loadMap(filteredHospitals)
    }
  }, [userLocation, isOffline, filteredHospitals])

  // Service worker registration removed — sw.js is not provided.
  // Offline caching behavior will fall back to in-page logic and
  // will not rely on a service worker file being present.

  const initializeOfflineData = async () => {
    try {
      // Load cached hospitals from localStorage
      const cached = localStorage.getItem("cachedHospitals")
      if (cached) {
        setCachedHospitals(JSON.parse(cached))
      }

      // Check if offline maps are available
      const offlineReady = localStorage.getItem("offlineMapReady")
      setOfflineMapReady(offlineReady === "true")

      // Cache current hospital data
      localStorage.setItem("cachedHospitals", JSON.stringify(mockHospitals))
      setCachedHospitals(mockHospitals)
    } catch (error) {
      console.error("Error initializing offline data:", error)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          // Cache user location for offline use
          localStorage.setItem("lastKnownLocation", JSON.stringify(location))
        },
        (error) => {
          console.error("Error getting location:", error)
          // Try to use cached location
          const cachedLocation = localStorage.getItem("lastKnownLocation")
          if (cachedLocation) {
            setUserLocation(JSON.parse(cachedLocation))
          } else {
            // Use default location (Hyderabad, Telangana)
            setUserLocation({ lat: 17.4239, lng: 78.4483 })
          }
        },
      )
    }
  }

  const downloadOfflineMaps = async () => {
    if (!userLocation) return

    setDownloadingMaps(true)
    try {
      // Calculate bounding box for map tiles (5km radius)
      const radius = 0.045 // approximately 5km in degrees
      const bounds = {
        north: userLocation.lat + radius,
        south: userLocation.lat - radius,
        east: userLocation.lng + radius,
        west: userLocation.lng - radius,
      }

      // Pre-cache map tiles for offline use
      const tilesToCache = []
      const zoomLevels = [10, 11, 12, 13, 14, 15] // Different zoom levels

      for (const zoom of zoomLevels) {
        const tileSize = 256
        const n = Math.pow(2, zoom)

        const minTileX = Math.floor(((bounds.west + 180) / 360) * n)
        const maxTileX = Math.floor(((bounds.east + 180) / 360) * n)
        const minTileY = Math.floor(
          ((1 -
            Math.log(Math.tan((bounds.north * Math.PI) / 180) + 1 / Math.cos((bounds.north * Math.PI) / 180)) /
              Math.PI) /
            2) *
            n,
        )
        const maxTileY = Math.floor(
          ((1 -
            Math.log(Math.tan((bounds.south * Math.PI) / 180) + 1 / Math.cos((bounds.south * Math.PI) / 180)) /
              Math.PI) /
            2) *
            n,
        )

        for (let x = minTileX; x <= maxTileX; x++) {
          for (let y = minTileY; y <= maxTileY; y++) {
            tilesToCache.push(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`)
          }
        }
      }

      // Cache tiles using service worker
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CACHE_TILES",
          tiles: tilesToCache.slice(0, 200), // Limit to prevent excessive caching
        })
      }

      // Store offline map metadata
      localStorage.setItem("offlineMapBounds", JSON.stringify(bounds))
      localStorage.setItem("offlineMapReady", "true")
      localStorage.setItem("offlineMapTimestamp", new Date().toISOString())

      setOfflineMapReady(true)
      toast({
        title: t("offlineMapDownloaded"),
        description: t("offlineMapDownloadedDesc"),
      })
    } catch (error) {
      console.error("Error downloading offline maps:", error)
      toast({
        title: t("offlineMapError"),
        description: t("offlineMapErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setDownloadingMaps(false)
    }
  }

  const loadMap = async (hospitalsToShow = filteredHospitals) => {
    try {
      const L = (await import("leaflet")).default

      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Clear existing map
      if (mapRef.current) {
        mapRef.current.remove()
      }

      // Initialize map
      const map = L.map("hospital-map").setView([userLocation!.lat, userLocation!.lng], 13)
      mapRef.current = map

      // Choose tile layer based on online/offline status
      let tileLayer
      if (isOffline && offlineMapReady) {
        // Use cached tiles for offline mode
        tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors (Offline Mode)",
          className: "offline-tiles",
        })
      } else {
        // Use online tiles
        tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        })
      }

      tileLayer.addTo(map)

      // Add user location marker with enhanced styling
      const userIcon = L.divIcon({
        html: `
          <div style="
            background-color: #3b82f6; 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -8px;
              left: -8px;
              width: 32px;
              height: 32px;
              border: 2px solid #3b82f6;
              border-radius: 50%;
              animation: pulse 2s infinite;
              opacity: 0.3;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        className: "user-location-marker",
      })

      const userMarker = L.marker([userLocation!.lat, userLocation!.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>${t("yourLocation")}</strong><br>
            <small>${isOffline ? t("offlineMode") : t("onlineMode")}</small>
          </div>
        `)

      // Clear existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker))
      markersRef.current = []

      // Add hospital markers with enhanced functionality
      hospitalsToShow.forEach((hospital) => {
        let iconHtml = ""
        let iconColor = hospital.emergencyServices ? "#ef4444" : "#10b981"
        iconHtml = `
          <div style="
            background-color: ${hospital.type === "diagnostic" ? "#6366f1" : hospital.type === "pharmacy" ? "#f59e42" : iconColor};
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${hospital.type === "diagnostic" ? 'D' : hospital.type === "pharmacy" ? 'P' : 'H'}
          </div>
        `
        const markerIcon = L.divIcon({
          html: iconHtml,
          iconSize: [32, 32],
          className:
            hospital.type === "diagnostic"
              ? "center-marker"
              : hospital.type === "pharmacy"
              ? "pharmacy-marker"
              : "hospital-marker",
        })
        const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${hospital.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📍 ${hospital.address}</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📞 ${hospital.phone}</p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">🚶 ${hospital.distance} km away</p>
              ${hospital.waitTime ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">⏱️ Wait: ${hospital.waitTime}</p>` : ""}
              ${hospital.beds ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">🏥 ${hospital.beds.available}/${hospital.beds.total} beds available</p>` : ""}
              <div style="display: flex; gap: 4px; margin-top: 8px;">
                <button onclick="window.getDirectionsOffline('${hospital.id}')" style="
                  background: #3b82f6;
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  cursor: pointer;">
                  Directions
                </button>
                <button onclick="window.location.href='tel:${hospital.phone}'" style="
                  background: #10b981;
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  cursor: pointer;">
                  Call
                </button>
              </div>
              ${isOffline ? `<p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">Last updated: ${new Date(hospital.lastUpdated || "").toLocaleString()}</p>` : ""}
            </div>
          `)
        markersRef.current.push(marker)
      })

      // Add offline route display
      if (selectedRoute && showOfflineRoute) {
        const routeLine = L.polyline(selectedRoute.coordinates, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.7,
        }).addTo(map)
        markersRef.current.push(routeLine)
      }
      // Global function for offline directions
      ;(window as any).getDirectionsOffline = (hospitalId: string) => {
        generateOfflineRoute(hospitalId)
      }

      setMapLoaded(true)

      // --- ENHANCED: Proactively cache visible tiles after map load and on pan/zoom ---
      function cacheVisibleTiles() {
        if (
          'serviceWorker' in navigator &&
          navigator.onLine &&
          map &&
          navigator.serviceWorker.controller
        ) {
          navigator.serviceWorker.ready.then((registration) => {
            if (registration.active) {
              const tiles = []
              const bounds = map.getBounds()
              const zoom = map.getZoom()
              const tileSize = 256
              const nw = map.project(bounds.getNorthWest(), zoom).divideBy(tileSize).floor()
              const se = map.project(bounds.getSouthEast(), zoom).divideBy(tileSize).floor()
              for (let x = nw.x; x <= se.x; x++) {
                for (let y = nw.y; y <= se.y; y++) {
                  tiles.push(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`)
                }
              }
              registration.active.postMessage({
                type: 'CACHE_TILES',
                tiles,
              })
            }
          })
        }
      }
      // Cache tiles on initial load
      cacheVisibleTiles()
      // Cache tiles on pan/zoom
      map.on('moveend zoomend', cacheVisibleTiles)
      // --- END ENHANCEMENT ---
    } catch (error) {
      console.error("Error loading map:", error)
      // Show fallback static map
      showFallbackMap()
    }
  }

  // Add helper functions for caching
  function getCacheKey(hospitalId: string, from: { lat: number; lng: number }) {
    const lat = from.lat.toFixed(3);
    const lng = from.lng.toFixed(3);
    return `directions_${hospitalId}_${lat}_${lng}`;
  }
  function cacheDirections(key: string, directions: any) {
    try {
      localStorage.setItem(key, JSON.stringify(directions));
    } catch {}
  }
  function getCachedDirections(key: string) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  const generateOfflineRoute = async (hospitalId: string) => {
    if (!userLocation) return
    const hospital = (isOffline ? cachedHospitals : mockHospitals).find((h) => h.id === hospitalId)
    if (!hospital) return
    const key = getCacheKey(hospital.id, userLocation)
    let route: OfflineRoute | null = null
    const cached = getCachedDirections(key)
    if (cached) {
      route = {
        distance: hospital.distance,
        duration: Math.round(hospital.distance * 3), // fallback duration
        coordinates: cached.geometry.coordinates,
        instructions: cached.steps,
      }
    } else if (!isOffline) {
      try {
        const result = await fetchDirectionsORS(userLocation, hospital.coordinates)
        route = {
          distance: hospital.distance,
          duration: Math.round(hospital.distance * 3), // fallback duration
          coordinates: result.geometry.coordinates,
          instructions: result.steps,
        }
        cacheDirections(key, result)
      } catch {
        route = null
      }
    }
    if (route) {
      setSelectedRoute(route)
      setShowOfflineRoute(true)
      loadMap(filteredHospitals)
      toast({
        title: t("offlineRouteGenerated"),
        description: `${t("routeTo")} ${hospital.name}`,
      })
    } else {
      toast({
        title: t("directionsUnavailable"),
        description: t("directionsUnavailableDesc"),
        variant: "destructive",
      })
    }
  }

  const showFallbackMap = () => {
    const mapContainer = document.getElementById("hospital-map")
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
        ">
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <h3 style="margin: 0 0 8px 0; color: #374151;">${t("offlineMapView")}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${t("offlineMapViewDesc")}</p>
            ${
              !offlineMapReady
                ? `
              <button onclick="window.location.reload()" style="
                margin-top: 12px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
              ">${t("downloadOfflineMaps")}</button>
            `
                : ""
            }
          </div>
        </div>
      `
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "open":
        return "bg-green-100 text-green-800"
      case "emergency-only":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleGetDirections = (hospital: HospitalData) => {
    if (isOffline) {
      generateOfflineRoute(hospital.id)
    } else {
      if (userLocation) {
        // Construct Google Maps directions URL
        const origin = `${userLocation.lat},${userLocation.lng}`
        const destination = `${hospital.coordinates.lat},${hospital.coordinates.lng}`
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        // fallback: just show hospital location
        const url = `https://www.google.com/maps/search/?api=1&query=${hospital.coordinates.lat},${hospital.coordinates.lng}`
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const handleCallHospital = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleEmergencyCall = () => {
    window.location.href = "tel:911"
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{t("nearbyHospitals")}</span>
              {isOffline ? (
                <WifiOff className="h-6 w-6 text-orange-500" />
              ) : (
                <Wifi className="h-6 w-6 text-green-500" />
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isOffline ? t("hospitalLocatorOfflineDesc") : t("hospitalLocatorDesc")}
            </p>
          </div>
          <div className="flex space-x-2">
            {!isOffline && (
              <Button
                onClick={downloadOfflineMaps}
                disabled={downloadingMaps}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{downloadingMaps ? t("downloading") : t("downloadOfflineMaps")}</span>
              </Button>
            )}
            <Button onClick={handleEmergencyCall} className="bg-red-600 hover:bg-red-700 text-white">
              <Ambulance className="h-4 w-4 mr-2" />
              {t("emergency911")}
            </Button>
          </div>
        </div>

        {/* Offline Status Banner */}
        {isOffline && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                <WifiOff className="h-5 w-5" />
                <div>
                  <p className="font-medium">{t("offlineMode")}</p>
                  <p className="text-sm">
                    {offlineMapReady ? t("offlineMapsAvailable") : t("offlineMapsNotAvailable")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("searchHospitals")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder={t("filterByType") || "Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes") || "All"}</SelectItem>
                  <SelectItem value="hospital">{t("hospitals") || "Hospitals"}</SelectItem>
                  <SelectItem value="diagnostic">{t("centers") || "Centers"}</SelectItem>
                  <SelectItem value="pharmacy">{t("pharmacies") || "Pharmacies"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("filterBySpecialty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allSpecialties")}</SelectItem>
                  <SelectItem value="emergency">{t("emergency")}</SelectItem>
                  <SelectItem value="cardiology">{t("cardiology")}</SelectItem>
                  <SelectItem value="pediatrics">{t("pediatrics")}</SelectItem>
                  <SelectItem value="orthopedics">{t("orthopedics")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">{t("distance")}</SelectItem>
                  <SelectItem value="rating">{t("rating")}</SelectItem>
                  <SelectItem value="availability">{t("availability")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-12 pt-12">
          {/* Enhanced Map with Offline Support - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{t("hospitalMap")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isOffline && offlineMapReady && (
                    <Badge variant="secondary" className="text-xs">
                      {t("cached")}
                    </Badge>
                  )}
                  {selectedRoute && (
                    <Button size="sm" variant="outline" onClick={() => setShowOfflineRoute(!showOfflineRoute)}>
                      <Route className="h-4 w-4 mr-1" />
                      {showOfflineRoute ? t("hideRoute") : t("showRoute")}
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="hospital-map" className="w-full h-96 rounded-lg bg-gray-100 flex items-center justify-center">
                {!mapLoaded && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">{t("loadingMap")}</p>
                  </div>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  {t("mapLegend")}: 🔵 {t("yourLocation")} | 🔴 {t("emergencyHospitals")} | 🟢 {t("regularHospitals")}
                </p>
                {isOffline && <p className="text-xs text-orange-600">{t("offlineMapNote")}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Hospital List with Offline Indicators */}
          <div className="space-y-4 mt-10">
            {/* Offline Route Display */}
            {selectedRoute && showOfflineRoute && (
              <Card className="border-b">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <Route className="h-5 w-5" />
                    <span>{t("offlineRoute")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {t("distance")}: {selectedRoute.distance} km
                      </span>
                      <span>
                        {t("estimatedTime")}: {selectedRoute.duration} min
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(selectedRoute.instructions && selectedRoute.instructions.length > 0) ? (
                        selectedRoute.instructions.map((instruction, index) => (
                          <p key={index} className="text-xs text-gray-600 dark:text-gray-300">
                            {index + 1}. {instruction}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-300">{t("noDirectionsAvailable")}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hospital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Ambulance className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{hospital.name}</h3>
                            <Badge className={getAvailabilityColor(hospital.availability)}>
                              {t(hospital.availability.replace("-", ""))}
                            </Badge>
                            {hospital.emergencyServices && (
                              <Badge variant="destructive" className="text-xs">
                                {t("emergency")}
                              </Badge>
                            )}
                            {isOffline && (
                              <Badge variant="outline" className="text-xs">
                                {t("cached")}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{hospital.address}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-blue-600 font-medium">({hospital.distance} km)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{hospital.phone}</span>
                            </div>
                            {hospital.waitTime && !isOffline && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {t("waitTime")}: {hospital.waitTime}
                                </span>
                              </div>
                            )}
                            {isOffline && hospital.lastUpdated && (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">
                                  {t("lastUpdated")}: {new Date(hospital.lastUpdated).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{hospital.rating}</span>
                            </div>
                            {hospital.beds && (
                              <div className="text-sm">
                                <span className="font-medium text-green-600">{hospital.beds.available}</span>
                                <span className="text-gray-500">
                                  /{hospital.beds.total} {t("bedsAvailable")}
                                </span>
                                {isOffline && <span className="text-orange-500 text-xs ml-1">({t("cached")})</span>}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {hospital.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetDirections(hospital)}
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {isOffline ? t("offlineDirections") : t("directions")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallHospital(hospital.phone)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {t("call")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Ambulance className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("noHospitalsFound")}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t("noHospitalsFoundDesc")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        
        .offline-tiles {
          filter: grayscale(20%) brightness(0.9);
        }
      `}</style>
    </PatientLayout>
  )
}
