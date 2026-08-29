"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { useState } from "react"
import { Camera, MapPin, Clock, User, AlertCircle, CheckCircle, XCircle, Plus, X, Upload, Mic, Loader2 } from "lucide-react"

type EvidenceStep = {
  id: string
  type: "initial" | "notification" | "correction" | "closed"
  title: string
  description: string
  photoUrl?: string
  timestamp: string
  author: string
}

type Deficiency = {
  id: string
  title: string
  location: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "in_progress" | "resolved"
  evidenceChain: EvidenceStep[]
  createdAt: string
}

export default function DeficienciesPage() {
  const [isSmartUploadOpen, setIsSmartUploadOpen] = useState(false)
  const [selectedDeficiency, setSelectedDeficiency] = useState<Deficiency | null>(null)
  const [uploadFormData, setUploadFormData] = useState({
    controlType: "",
    section: "",
    photo: null as File | null
  })
  const [mockGPS, setMockGPS] = useState<{ lat: string; lng: string } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data for deficiencies
  const [deficiencies] = useState<Deficiency[]>([
    {
      id: "1",
      title: "Donatı aralığı standartlara uymuyor",
      location: "A Blok - Zemin Kat - Kolon K3",
      severity: "critical",
      status: "in_progress",
      createdAt: "2024-08-25T10:30:00",
      evidenceChain: [
        {
          id: "e1",
          type: "initial",
          title: "İlk Fotoğraf (Kırmızı Kalem İşaretli)",
          description: "Donatı aralığı 25cm ölçüldü, standart 20cm olmalı",
          photoUrl: "https://via.placeholder.com/150",
          timestamp: "2024-08-25T10:30:00",
          author: "Ahmet Yılmaz"
        },
        {
          id: "e2",
          type: "notification",
          title: "Müteahhit Bildirimi",
          description: "Müteahhit firmaya eksiklik bildirildi",
          timestamp: "2024-08-25T11:00:00",
          author: "Ahmet Yılmaz"
        },
        {
          id: "e3",
          type: "correction",
          title: "Düzeltme Fotoğrafı",
          description: "Donatı aralığı düzeltildi, 20cm olarak yeniden düzenlendi",
          photoUrl: "https://via.placeholder.com/150",
          timestamp: "2024-08-26T14:00:00",
          author: "Mehmet Kaya"
        }
      ]
    },
    {
      id: "2",
      title: "Beton yüzeyinde çatlak tespit edildi",
      location: "B Blok - 2. Kat - Döşeme",
      severity: "high",
      status: "open",
      createdAt: "2024-08-27T09:15:00",
      evidenceChain: [
        {
          id: "e4",
          type: "initial",
          title: "İlk Fotoğraf (Kırmızı Kalem İşaretli)",
          description: "Döşeme yüzeyinde 2mm çatlak tespit edildi",
          photoUrl: "https://via.placeholder.com/150",
          timestamp: "2024-08-27T09:15:00",
          author: "Ayşe Demir"
        },
        {
          id: "e5",
          type: "notification",
          title: "Müteahhit Bildirimi",
          description: "Müteahhit firmaya çatlak bildirimi yapıldı",
          timestamp: "2024-08-27T09:45:00",
          author: "Ayşe Demir"
        }
      ]
    },
    {
      id: "3",
      title: "Kalıp sökümü erken yapıldı",
      location: "C Blok - 1. Kat - Kiriş K1",
      severity: "medium",
      status: "resolved",
      createdAt: "2024-08-20T16:00:00",
      evidenceChain: [
        {
          id: "e6",
          type: "initial",
          title: "İlk Fotoğraf (Kırmızı Kalem İşaretli)",
          description: "Kalıp 7 gün yerine 5 günde söküldü",
          photoUrl: "https://via.placeholder.com/150",
          timestamp: "2024-08-20T16:00:00",
          author: "Ali Öztürk"
        },
        {
          id: "e7",
          type: "notification",
          title: "Müteahhit Bildirimi",
          description: "Müteahhit firmaya erken kalıp sökümü bildirildi",
          timestamp: "2024-08-20T16:30:00",
          author: "Ali Öztürk"
        },
        {
          id: "e8",
          type: "correction",
          title: "Düzeltme Fotoğrafı",
          description: "Yapısal analiz yapıldı, sorun bulunmadı",
          photoUrl: "https://via.placeholder.com/150",
          timestamp: "2024-08-22T10:00:00",
          author: "Mühendislik Ekibi"
        },
        {
          id: "e9",
          type: "closed",
          title: "Kapatıldı (Yeşil)",
          description: "Eksiklik kapatıldı, onaylandı",
          timestamp: "2024-08-22T11:00:00",
          author: "Ali Öztürk"
        }
      ]
    }
  ])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFormData({ ...uploadFormData, photo: file })
      // Mock GPS coordinates
      setMockGPS({
        lat: (36.8 + Math.random() * 0.1).toFixed(6),
        lng: (30.5 + Math.random() * 0.1).toFixed(6)
      })
    }
  }

  const handleVoiceRecording = () => {
    setIsRecording(true)
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)
      setIsProcessing(true)
      // Simulate processing for 2 seconds
      setTimeout(() => {
        setIsProcessing(false)
        // Auto-fill form with mock data
        setUploadFormData({
          controlType: "Donatı",
          section: "C12 Kolonu - 2. Kat",
          photo: uploadFormData.photo
        })
        // Mock GPS coordinates
        setMockGPS({
          lat: (36.8 + Math.random() * 0.1).toFixed(6),
          lng: (30.5 + Math.random() * 0.1).toFixed(6)
        })
      }, 2000)
    }, 3000)
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
    const labels = {
      critical: "Kritik",
      high: "Yüksek",
      medium: "Orta",
      low: "Düşük"
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[severity as keyof typeof badges]}`}>
        {labels[severity as keyof typeof labels]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: "bg-red-500/20 text-red-400",
      in_progress: "bg-yellow-500/20 text-yellow-400",
      resolved: "bg-green-500/20 text-green-400"
    }
    const labels = {
      open: "Açık",
      in_progress: "İşlemde",
      resolved: "Çözüldü"
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "initial": return XCircle
      case "notification": return AlertCircle
      case "correction": return Camera
      case "closed": return CheckCircle
      default: return AlertCircle
    }
  }

  const getEvidenceColor = (type: string) => {
    switch (type) {
      case "initial": return "text-red-400 bg-red-500/20 border-red-500/30"
      case "notification": return "text-orange-400 bg-orange-500/20 border-orange-500/30"
      case "correction": return "text-blue-400 bg-blue-500/20 border-blue-500/30"
      case "closed": return "text-green-400 bg-green-500/20 border-green-500/30"
      default: return "text-slate-400 bg-slate-500/20 border-slate-500/30"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            Eksiklik Yönetimi
          </h1>
          <p className="text-slate-400 mt-1">Şantiye eksiklikleri ve kanıt zinciri takibi</p>
        </div>
        <button
          onClick={() => setIsSmartUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Camera className="w-5 h-5" />
          Akıllı Fotoğraf Yükle
        </button>
      </div>

      {/* Deficiencies List */}
      <div className="space-y-4">
        {deficiencies.map((deficiency) => (
          <div key={deficiency.id} className="bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-800 overflow-hidden">
            {/* Deficiency Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{deficiency.title}</h3>
                    {getSeverityBadge(deficiency.severity)}
                    {getStatusBadge(deficiency.status)}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{deficiency.location}</p>
                  <p className="text-slate-500 text-xs">
                    Oluşturulma: {new Date(deficiency.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeficiency(deficiency)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                >
                  Kanıt Zincirini Gör
                </button>
              </div>
            </div>

            {/* Evidence Chain Preview */}
            <div className="p-4 bg-slate-800/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Kanıt Adımları:</span>
                {deficiency.evidenceChain.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {index > 0 && <span className="text-slate-600 mx-2">→</span>}
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEvidenceColor(step.type)}`}>
                      {index + 1}. {step.title.split('(')[0].trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Photo Upload Modal */}
      {isSmartUploadOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-400" />
                Akıllı Fotoğraf Yükleme
              </h2>
              <button
                onClick={() => {
                  setIsSmartUploadOpen(false)
                  setUploadFormData({ controlType: "", section: "", photo: null })
                  setMockGPS(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Kontrol Tipi</label>
                <select
                  value={uploadFormData.controlType}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, controlType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="donati">Donatı</option>
                  <option value="beton">Beton</option>
                  <option value="kalip">Kalıp</option>
                  <option value="duvar">Duvar</option>
                  <option value="doseme">Döşeme</option>
                  <option value="kolon">Kolon</option>
                  <option value="kiris">Kiriş</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">İlgili Bölüm</label>
                <select
                  value={uploadFormData.section}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, section: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="temel">Temel</option>
                  <option value="bodrum">Bodrum</option>
                  <option value="zemin">Zemin Kat</option>
                  <option value="1kat">1. Kat</option>
                  <option value="2kat">2. Kat</option>
                  <option value="cati">Çatı</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Fotoğraf</label>
                <label className="flex items-center justify-center w-full h-32 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-slate-400 text-sm">
                      {uploadFormData.photo ? uploadFormData.photo.name : "Fotoğraf seçmek için tıklayın"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Voice Recording Button */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/30">
                <button
                  onClick={handleVoiceRecording}
                  disabled={isRecording || isProcessing}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecording ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Dinleniyor...</span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>🎤 Sesli Kayıt</span>
                    </>
                  )}
                </button>
                <p className="text-slate-400 text-xs text-center mt-2">
                  Konarak eksiklik girişi yapabilirsiniz
                </p>
              </div>

              {/* GPS and Timestamp Card */}
              {mockGPS && (
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-500/30">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Konum ve Zaman Bilgisi
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">GPS Koordinatı</p>
                        <p className="text-sm text-white font-mono">{mockGPS.lat}, {mockGPS.lng}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">Zaman Damgası</p>
                        <p className="text-sm text-white">{new Date().toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Denetçi</p>
                        <p className="text-sm text-white">Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsSmartUploadOpen(false)
                  setUploadFormData({ controlType: "", section: "", photo: null })
                  setMockGPS(null)
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  // Handle upload logic here
                  setIsSmartUploadOpen(false)
                  setUploadFormData({ controlType: "", section: "", photo: null })
                  setMockGPS(null)
                }}
                disabled={!uploadFormData.photo || !uploadFormData.controlType || !uploadFormData.section}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yükle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Chain Modal */}
      {selectedDeficiency && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                Kanıt Zinciri
              </h2>
              <button
                onClick={() => setSelectedDeficiency(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedDeficiency.title}</h3>
                <p className="text-slate-400 text-sm">{selectedDeficiency.location}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {selectedDeficiency.evidenceChain.map((step, index) => {
                  const Icon = getEvidenceIcon(step.type)
                  return (
                    <div key={step.id} className="relative pl-8">
                      {/* Timeline Line */}
                      {index < selectedDeficiency.evidenceChain.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-700" />
                      )}
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getEvidenceColor(step.type)}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      {/* Content */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{step.title}</h4>
                          <span className="text-xs text-slate-500">
                            {new Date(step.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{step.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <User className="w-3 h-3" />
                          <span>{step.author}</span>
                        </div>
                        {step.photoUrl && (
                          <div className="mt-3">
                            <img
                              src={step.photoUrl}
                              alt="Evidence"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
