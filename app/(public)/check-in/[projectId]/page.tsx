"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"

export default function CheckInPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [activeTab, setActiveTab] = useState<"worker" | "visitor">("worker")
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Worker form state
  const [workerForm, setWorkerForm] = useState({
    username: "",
    password: ""
  })

  // Visitor form state
  const [visitorForm, setVisitorForm] = useState({
    fullName: "",
    company: "",
    reason: ""
  })

  useEffect(() => {
    fetchProject()
  }, [projectId])

  // Read shift hours from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && project) {
      const urlParams = new URLSearchParams(window.location.search)
      const dataParam = urlParams.get('data')
      if (dataParam) {
        try {
          const qrData = JSON.parse(decodeURIComponent(dataParam))
          if (qrData.shiftStart && qrData.shiftEnd) {
            // Update project with shift hours from QR
            setProject(prev => ({
              ...prev,
              shiftStart: qrData.shiftStart,
              shiftEnd: qrData.shiftEnd
            }))
          }
        } catch (error) {
          console.error("Failed to parse QR data:", error)
        }
      }
    }
  }, [project])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast.error("Proje bulunamadı")
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("Proje yüklenirken hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workerForm.username || !workerForm.password) {
      toast.error("Kullanıcı adı ve şifre zorunludur")
      return
    }

    try {
      const response = await fetch("/api/attendance/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...workerForm,
          projectId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "İşlem başarılı")
        setWorkerForm({ username: "", password: "" })
      } else {
        const error = await response.json()
        toast.error(error.error || "İşlem başarısız")
      }
    } catch (error) {
      toast.error("İşlem sırasında hata oluştu")
    }
  }

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!visitorForm.fullName) {
      toast.error("Ad Soyad zorunludur")
      return
    }

    try {
      const response = await fetch("/api/attendance/visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...visitorForm,
          projectId
        })
      })

      if (response.ok) {
        toast.success("Ziyaretçi kaydı başarıyla oluşturuldu")
        setVisitorForm({ fullName: "", company: "", reason: "" })
      } else {
        const error = await response.json()
        toast.error(error.error || "Kayıt başarısız")
      }
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Proje bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {project.name || project.title}
          </h1>
          <p className="text-slate-400">Şantiye Giriş Sistemi</p>
          {project.shiftStart && project.shiftEnd && (
            <div className="mt-3 px-4 py-2 bg-blue-900/30 border border-blue-800 rounded-lg inline-block">
              <p className="text-blue-400 text-sm">
                ⏰ Mesai Saatleri: {project.shiftStart} - {project.shiftEnd}
              </p>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("worker")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "worker"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👷 Personel Girişi
          </button>
          <button
            onClick={() => setActiveTab("visitor")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "visitor"
                ? "bg-green-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👤 Ziyaretçi Girişi
          </button>
        </div>

        {/* Worker Form */}
        {activeTab === "worker" && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">Personel Giriş/Çıkış</h2>
            <form onSubmit={handleWorkerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={workerForm.username}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Örn: ahmet.yilmaz"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={workerForm.password}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
              >
                Giriş/Çıkış Yap
              </button>
            </form>
          </div>
        )}

        {/* Visitor Form */}
        {activeTab === "visitor" && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">Ziyaretçi Kaydı</h2>
            <form onSubmit={handleVisitorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={visitorForm.fullName}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Firma/Kurum
                </label>
                <input
                  type="text"
                  value={visitorForm.company}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Firma adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ziyaret Sebebi
                </label>
                <input
                  type="text"
                  value={visitorForm.reason}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Örn: Malzeme teslimi, Denetim"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
              >
                Ziyaretçi Girişi Yap
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Mahir Bakay Mühendislik</p>
        </div>
      </div>
    </div>
  )
}