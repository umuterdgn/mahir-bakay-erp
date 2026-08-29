"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { useState } from "react"
import { MapPin, X, AlertTriangle, Clock, CheckCircle } from "lucide-react"

interface ProjectPin {
  id: string
  yibf: string
  name: string
  status: "critical" | "warning" | "normal"
  progress: number
  missingDocs: number
  x: number
  y: number
}

export default function MapPage() {
  const [selectedPin, setSelectedPin] = useState<ProjectPin | null>(null)

  const pins: ProjectPin[] = [
    { id: "1", yibf: "14582", name: "Yapı A", status: "critical", progress: 12, missingDocs: 8, x: 20, y: 30 },
    { id: "2", yibf: "14585", name: "Yapı B", status: "warning", progress: 45, missingDocs: 3, x: 45, y: 25 },
    { id: "3", yibf: "14590", name: "Yapı C", status: "normal", progress: 78, missingDocs: 1, x: 70, y: 40 },
    { id: "4", yibf: "14595", name: "Yapı D", status: "critical", progress: 8, missingDocs: 12, x: 35, y: 60 },
    { id: "5", yibf: "14600", name: "Yapı E", status: "normal", progress: 92, missingDocs: 0, x: 60, y: 70 },
    { id: "6", yibf: "14605", name: "Yapı F", status: "warning", progress: 55, missingDocs: 4, x: 80, y: 55 },
  ]

  const getPinColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500"
      case "warning": return "bg-orange-500"
      case "normal": return "bg-green-500"
      default: return "bg-slate-500"
    }
  }

  const getPinIcon = (status: string) => {
    switch (status) {
      case "critical": return <AlertTriangle className="w-4 h-4" />
      case "warning": return <Clock className="w-4 h-4" />
      case "normal": return <CheckCircle className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-100 text-red-700"
      case "warning": return "bg-orange-100 text-orange-700"
      case "normal": return "bg-green-100 text-green-700"
      default: return "bg-slate-100 text-slate-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical": return "Kritik"
      case "warning": return "Takip"
      case "normal": return "Normal"
      default: return "Bilinmiyor"
    }
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-400" />
          Şantiye Haritası
        </h1>
        <p className="text-slate-400 mt-1">YİBF durumlarına göre coğrafi dağılım</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full" />
          <span className="text-sm text-slate-300">Kritik</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full" />
          <span className="text-sm text-slate-300">Takip</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-sm text-slate-300">Normal</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(to right, #475569 1px, transparent 1px),
              linear-gradient(to bottom, #475569 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
          
          {/* Map Features */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        {/* Pins */}
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            className={`absolute w-8 h-8 ${getPinColor(pin.status)} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {getPinIcon(pin.status)}
          </button>
        ))}

        {/* Popup */}
        {selectedPin && (
          <div
            className="absolute bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-2xl w-64 z-10"
            style={{ left: `${selectedPin.x}%`, top: `${selectedPin.y}%`, transform: 'translate(-50%, -120%)' }}
          >
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 ${getPinColor(selectedPin.status)} rounded-lg flex items-center justify-center text-white`}>
                {getPinIcon(selectedPin.status)}
              </div>
              <div>
                <h3 className="font-semibold text-white">YİBF {selectedPin.yibf}</h3>
                <p className="text-sm text-slate-400">{selectedPin.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Durum</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(selectedPin.status)}`}>
                  {getStatusText(selectedPin.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">İlerleme</span>
                <span className="text-sm font-medium text-white">%{selectedPin.progress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Eksik Evrak</span>
                <span className={`text-sm font-medium ${selectedPin.missingDocs > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedPin.missingDocs}
                </span>
              </div>
            </div>

            <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm">
              Detayları Gör
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
