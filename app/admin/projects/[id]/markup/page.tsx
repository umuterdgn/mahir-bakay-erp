"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import dynamic from "next/dynamic"
import PhotoAnnotator from "@/components/PhotoAnnotator"

const AnnotatableFloorPlanViewer = dynamic(
  () => import("@/components/AnnotatableFloorPlanViewer"),
  { ssr: false, loading: () => <div className="w-full h-[600px] bg-slate-900 animate-pulse rounded-xl flex items-center justify-center">CAD Yükleniyor...</div> }
)

export default function MarkupPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<"blueprint" | "photo">("blueprint")
  const [reportDescription, setReportDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // DWG file URL for CAD viewer
  const [dwgFileUrl, setDwgFileUrl] = useState<string | null>(null)
  const [dwgFile, setDwgFile] = useState<File | null>(null)
  
  // Store annotation data
  const [markedBlueprintBase64, setMarkedBlueprintBase64] = useState<string>("")
  const [markedPhotoBase64, setMarkedPhotoBase64] = useState<string>("")
  const [uploadedPhoto, setUploadedPhoto] = useState<string>("")

  const handleDwgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDwgFile(file)
    const url = URL.createObjectURL(file)
    setDwgFileUrl(url)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen JPG, PNG veya PDF dosyası yükleyin")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedPhoto(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveReport = async () => {
    if (!reportDescription.trim()) {
      toast.error("Lütfen bir açıklama girin")
      return
    }

    if (!markedBlueprintBase64 && !markedPhotoBase64) {
      toast.error("Lütfen en az bir işaretleme yapın")
      return
    }

    setIsSaving(true)
    try {
      // Upload annotation images to Cloudinary
      const uploadPromises = []
      
      if (markedBlueprintBase64) {
        const blueprintBlob = await (await fetch(markedBlueprintBase64)).blob()
        const blueprintFormData = new FormData()
        blueprintFormData.append("file", blueprintBlob, "blueprint-annotation.png")
        
        uploadPromises.push(
          fetch("/api/upload", {
            method: "POST",
            body: blueprintFormData
          }).then(res => res.json())
        )
      }
      
      if (markedPhotoBase64) {
        const photoBlob = await (await fetch(markedPhotoBase64)).blob()
        const photoFormData = new FormData()
        photoFormData.append("file", photoBlob, "photo-annotation.png")
        
        uploadPromises.push(
          fetch("/api/upload", {
            method: "POST",
            body: photoFormData
          }).then(res => res.json())
        )
      }

      const uploadResults = await Promise.all(uploadPromises)
      
      const markedBlueprintUrl = uploadResults[0]?.url || null
      const markedPhotoUrl = uploadResults[1]?.url || null

      // Save inspection report
      const reportResponse = await fetch("/api/admin/inspection-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: unwrappedParams.id,
          description: reportDescription,
          markedBlueprintUrl,
          markedPhotoUrl
        })
      })

      if (reportResponse.ok) {
        toast.success("Rapor başarıyla kaydedildi")
        router.push(`/admin/projects/${unwrappedParams.id}`)
      } else {
        throw new Error("Failed to save report")
      }
    } catch (error) {
      console.error("Error saving report:", error)
      toast.error("Rapor kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/projects/${unwrappedParams.id}`)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ← Projeye Dön
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-white">İşaretleme ve Hasar Tespiti</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
        {/* Canvas Area */}
        <div className="flex-1 bg-slate-800 p-4 md:p-6">
          {/* Sekme Kapsayıcısı - Relative zorunlu */}
          <div className="flex-1 relative min-h-[600px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              
              {/* Plan Çizim Alanı (Opacity & Z-index ile gizle/göster) */}
              <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${activeTab === 'blueprint' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
                  {dwgFileUrl ? (
                    <AnnotatableFloorPlanViewer 
                      fileUrl={dwgFileUrl} 
                      onSaveAnnotation={(dataUrl) => {
                        setMarkedBlueprintBase64(dataUrl)
                        toast.success("Çizim hafızaya alındı, Raporu Kaydet'e basabilirsiniz.")
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <span className="text-6xl mb-4">📐</span>
                      <p>Planı görüntülemek için sağ taraftan bir DWG/DXF dosyası yükleyin</p>
                    </div>
                  )}
              </div>

              {/* Fotoğraf Alanı */}
              <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${activeTab === 'photo' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
                  <PhotoAnnotator 
                    onSaveAnnotation={(dataUrl) => setMarkedPhotoBase64(dataUrl)} 
                  />
              </div>
              
          </div>
        </div>

        {/* Toolbar */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-4 md:p-6 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("blueprint")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "blueprint"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              📋 Plan Üzerinde Çiz
            </button>
            <button
              onClick={() => setActiveTab("photo")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "photo"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              📸 Sahadan Fotoğraf
            </button>
          </div>

          {/* Tab-specific content */}
          {activeTab === "blueprint" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">DWG/DXF Dosyası Yükle</label>
                <input
                  type="file"
                  accept=".dwg,.dxf"
                  onChange={handleDwgFileChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === "photo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fotoğraf Çek/Yükle</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* Report Form */}
          <div className="border-t border-slate-700 pt-4 flex-1">
            <h3 className="text-sm font-semibold text-white mb-3">Rapor Açıklaması</h3>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Hasar tespiti açıklamasını girin..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none h-32"
            />
            <button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="w-full mt-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? "Kaydediliyor..." : "💾 Raporu Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}