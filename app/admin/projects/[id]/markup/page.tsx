"use client"

import { useState, useEffect, useRef, use } from "react"
import { fabric } from "fabric"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function MarkupPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const router = useRouter()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  const [activeTab, setActiveTab] = useState<"blueprint" | "photo">("blueprint")
  const [isDrawing, setIsDrawing] = useState(false)
  const [reportDescription, setReportDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Store canvas data for both tabs
  const [blueprintData, setBlueprintData] = useState<string>("")
  const [photoData, setPhotoData] = useState<string>("")
  const [uploadedPhoto, setUploadedPhoto] = useState<string>("")
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    // Calculate canvas dimensions based on container
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = Math.max(500, window.innerHeight - 300)

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "#ffffff"
    })
    setFabricCanvas(canvas)

    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth
        const newHeight = Math.max(500, window.innerHeight - 300)
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)
      }
    }
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      if (canvas) {
        canvas.dispose()
      }
    }
  }, [])

  // Save current canvas data when switching tabs
  const handleTabSwitch = (newTab: "blueprint" | "photo") => {
    if (fabricCanvas) {
      const currentData = fabricCanvas.toDataURL({
        format: "png",
        quality: 1
      })
      
      if (activeTab === "blueprint") {
        setBlueprintData(currentData)
      } else {
        setPhotoData(currentData)
      }
    }
    
    setActiveTab(newTab)
    
    // Restore canvas data when switching back
    setTimeout(() => {
      if (fabricCanvas) {
        const dataToRestore = newTab === "blueprint" ? blueprintData : photoData
        if (dataToRestore) {
          fabric.Image.fromURL(dataToRestore, (img) => {
            fabricCanvas.clear()
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
              originX: 'left',
              originY: 'top',
              left: 0,
              top: 0
            })
          })
        } else {
          fabricCanvas.clear()
          fabricCanvas.setBackgroundColor("#ffffff", () => {})
        }
        
        // Restore photo background if switching to photo tab
        if (newTab === "photo" && uploadedPhoto) {
          restorePhotoBackground()
        }
      }
    }, 100)
  }

  const restorePhotoBackground = () => {
    if (!fabricCanvas || !uploadedPhoto) return
    
    fabric.Image.fromURL(uploadedPhoto, (img) => {
      const canvasWidth = fabricCanvas.width!
      const canvasHeight = fabricCanvas.height!
      const imgWidth = img.width!
      const imgHeight = img.height!
      
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
      img.scale(scale)
      
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2
      })
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const photoData = event.target?.result as string
      setUploadedPhoto(photoData)
      
      if (fabricCanvas) {
        fabric.Image.fromURL(photoData, (img) => {
          const canvasWidth = fabricCanvas.width!
          const canvasHeight = fabricCanvas.height!
          const imgWidth = img.width!
          const imgHeight = img.height!
          
          const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
          img.scale(scale)
          
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
            originX: 'center',
            originY: 'center',
            left: canvasWidth / 2,
            top: canvasHeight / 2
          })
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !fabricCanvas) return

    const reader = new FileReader()
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target?.result as string, (img) => {
        const canvasWidth = fabricCanvas.width!
        const canvasHeight = fabricCanvas.height!
        const imgWidth = img.width!
        const imgHeight = img.height!
        
        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
        img.scale(scale)
        
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2
        })
      })
    }
    reader.readAsDataURL(file)
  }

  const enableDrawing = () => {
    if (!fabricCanvas) return
    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
    fabricCanvas.freeDrawingBrush.color = "#ef4444"
    fabricCanvas.freeDrawingBrush.width = 3
    setIsDrawing(true)
  }

  const disableDrawing = () => {
    if (!fabricCanvas) return
    fabricCanvas.isDrawingMode = false
    setIsDrawing(false)
  }

  const handleClear = () => {
    if (!fabricCanvas) return
    fabricCanvas.clear()
    fabricCanvas.setBackgroundColor("#ffffff", () => {})
    if (activeTab === "photo" && uploadedPhoto) {
      restorePhotoBackground()
    }
  }

  const handleSaveReport = async () => {
    if (!fabricCanvas) return
    
    // Save current canvas data
    const currentData = fabricCanvas.toDataURL({
      format: "png",
      quality: 1
    })
    
    if (activeTab === "blueprint") {
      setBlueprintData(currentData)
    } else {
      setPhotoData(currentData)
    }

    if (!reportDescription.trim()) {
      toast.error("Lütfen bir açıklama girin")
      return
    }

    setIsSaving(true)
    try {
      // Upload both images to Cloudinary
      const uploadPromises = []
      
      if (blueprintData) {
        uploadPromises.push(
          fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              file: blueprintData, 
              filename: `blueprint-${Date.now()}.png` 
            })
          }).then(res => res.json())
        )
      }
      
      if (photoData) {
        uploadPromises.push(
          fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              file: photoData, 
              filename: `photo-${Date.now()}.png` 
            })
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
        <div className="flex-1 bg-slate-800 p-4 md:p-6 flex items-center justify-center" ref={containerRef}>
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-4 md:p-6 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabSwitch("blueprint")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "blueprint"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              📋 Plan Üzerinde Çiz
            </button>
            <button
              onClick={() => handleTabSwitch("photo")}
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Plan Dosyası Yükle</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePlanUpload}
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
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* Drawing Tools */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Çizim Araçları</h3>
            <div className="flex gap-2">
              <button
                onClick={enableDrawing}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDrawing
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                ✏️ Kırmızı Kalem
              </button>
              <button
                onClick={disableDrawing}
                className="flex-1 px-3 py-2 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                🖱️ Seç
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-700 pt-4">
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors mb-3"
            >
              Temizle
            </button>
          </div>

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
