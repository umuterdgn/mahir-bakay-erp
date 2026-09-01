"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Link from "next/link"

export const dynamic = 'force-dynamic'

type ViewMode = "list" | "kanban"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tüm Projeler")

  useEffect(() => {
    fetchProjects()
    fetchCompanies()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects", { cache: 'no-store' })
      if (!response.ok) {
        setProjects([])
        return
      }

      const data = await response.json().catch(() => [])
      setProjects(Array.isArray(data) ? data : (data.projects || []))
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      setProjects([])
      toast.error("Projeler yüklenirken hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/crm")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    }
  }

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success("Proje durumu güncellendi")
        fetchProjects()
      } else {
        toast.error("Durum güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Durum güncellenirken hata oluştu")
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Proje başarıyla silindi")
        fetchProjects()
      } else {
        toast.error("Proje silinirken hata oluştu")
      }
    } catch (error) {
      toast.error("Proje silinirken hata oluştu")
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ETUT": return "Etüt"
      case "CIZIM": return "Çizim"
      case "SAHA": return "Saha"
      case "TAMAMLANDI": return "Tamamlandı"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ETUT": return "bg-purple-900/50 text-purple-400"
      case "CIZIM": return "bg-blue-900/50 text-blue-400"
      case "SAHA": return "bg-orange-900/50 text-orange-400"
      case "TAMAMLANDI": return "bg-green-900/50 text-green-400"
      default: return "bg-slate-900/50 text-slate-400"
    }
  }

  const getProjectsByStatus = (status: string) => {
    return filteredProjects.filter(p => p.status === status)
  }

  const categories = ["Tüm Projeler", "Güçlendirme", "Paket İş", "Kentsel Dönüşüm", "Performans Analizi", "Danışmanlık"]

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.parsel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mintika?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "Tüm Projeler" || project.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="lg:mt-0 mt-16">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Proje Yönetimi
          </h1>
          <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === "kanban"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pano
            </button>
          </div>
          <button
            onClick={() => router.push("/admin/projects/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Yeni Proje Ekle
          </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Proje ara (Ad, Parsel, Mahalle Adı, Firma, Müşteri)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Proje Adı</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Firma</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Konum</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{project.name}</div>
                          <div className="text-sm text-slate-400">{project.parsel && `Parsel: ${project.parsel}`}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{project.company?.name || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{project.category || "-"}</td>
                      <td className="px-6 py-4 text-slate-300">{project.city ? `${project.city}, ${project.district}` : "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Detay
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                Proje bulunamadı
              </div>
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["ETUT", "CIZIM", "SAHA", "TAMAMLANDI"].map((status) => (
              <div key={status} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{getStatusLabel(status)}</h3>
                  <span className="text-sm text-slate-400">{getProjectsByStatus(status).length}</span>
                </div>
                <div className="space-y-3">
                  {getProjectsByStatus(status).map((project) => (
                    <div
                      key={project.id}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/projects/${project.id}`)}
                    >
                      <div className="font-medium text-white mb-2">{project.name}</div>
                      <div className="text-sm text-slate-400 mb-2">{project.parsel && `Parsel: ${project.parsel}`}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{project.company?.name || "-"}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(project.id, status === "ETUT" ? "CIZIM" : status === "CIZIM" ? "SAHA" : status === "SAHA" ? "TAMAMLANDI" : "ETUT")
                            }}
                            className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded"
                          >
                            İleri
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(project.id)
                            }}
                            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getProjectsByStatus(status).length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-8">
                      Proje yok
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}