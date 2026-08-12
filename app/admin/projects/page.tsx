"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import Link from "next/link"

type ViewMode = "list" | "kanban"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tüm Projeler")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ETUT",
    companyId: "",
    startDate: "",
    endDate: "",
    category: "",
    city: "",
    district: "",
    mintika: "",
    ada: "",
    parsel: "",
    clientName: "",
    siteManager: "",
    engineer: "",
    architect: "",
    shiftStart: "08:00",
    shiftEnd: "17:00"
  })

  useEffect(() => {
    fetchProjects()
    fetchCompanies()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.status) {
      toast.error("Proje adı ve durumu zorunludur")
      return
    }

    console.log("Gönderilecek Veri:", formData)

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("Proje başarıyla eklendi")
        fetchProjects()
        closeModal()
      } else {
        const errorData = await response.json()
        toast.error(`Proje eklenirken hata: ${errorData.details || errorData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      toast.error("Proje eklenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
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

  const openModal = () => {
    setFormData({
      name: "",
      description: "",
      status: "ETUT",
      companyId: "",
      startDate: "",
      endDate: "",
      category: "",
      city: "",
      district: "",
      mintika: "",
      ada: "",
      parsel: "",
      clientName: "",
      siteManager: "",
      engineer: "",
      architect: "",
      shiftStart: "08:00",
      shiftEnd: "17:00"
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      name: "",
      description: "",
      status: "ETUT",
      companyId: "",
      startDate: "",
      endDate: "",
      category: "",
      city: "",
      district: "",
      mintika: "",
      ada: "",
      parsel: "",
      clientName: "",
      siteManager: "",
      engineer: "",
      architect: "",
      shiftStart: "08:00",
      shiftEnd: "17:00"
    })
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

  const filteredProjects = projects.filter(project => {
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
            onClick={openModal}
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
            placeholder="Proje adı, parsel, mıntıka veya firma adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-4 pl-12 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 text-lg"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Proje Adı</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Firma</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Başlangıç</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Durum</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Yükleniyor...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Proje kaydı bulunamadı
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/projects/${project.id}`}
                        className="text-white font-medium hover:text-blue-400 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {project.city && project.district && (
                          <span className="text-xs text-slate-500">
                            {project.city} - {project.district}
                          </span>
                        )}
                        {project.category && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300`}>
                            {project.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {project.company ? project.company.name : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(project.startDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="ETUT">Etüt</option>
                        <option value="CIZIM">Çizim</option>
                        <option value="SAHA">Saha</option>
                        <option value="TAMAMLANDI">Tamamlandı</option>
                      </select>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["ETUT", "CIZIM", "SAHA", "TAMAMLANDI"].map((status) => (
            <div key={status} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {getStatusLabel(status)}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {getProjectsByStatus(status).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {getProjectsByStatus(status).map((project) => (
                  <div key={project.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-white font-medium mb-2">
                      <Link 
                        href={`/admin/projects/${project.id}`}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      {project.city && project.district && (
                        <span className="text-xs text-slate-500">
                          {project.city} - {project.district}
                        </span>
                      )}
                      {project.category && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300`}>
                          {project.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      {project.company ? project.company.name : "Firma yok"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">
                        {new Date(project.startDate).toLocaleDateString("tr-TR")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="ETUT">Etüt</option>
                          <option value="CIZIM">Çizim</option>
                          <option value="SAHA">Saha</option>
                          <option value="TAMAMLANDI">Tamamlandı</option>
                        </select>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Yeni Proje Ekle</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Proje Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Proje adı..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Proje Açıklaması
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Proje açıklaması..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Firma
                </label>
                <select
                  name="companyId"
                  value={formData.companyId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Firma Seçin</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Durum *
                </label>
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  <option value="ETUT">Etüt</option>
                  <option value="CIZIM">Çizim</option>
                  <option value="SAHA">Saha</option>
                  <option value="TAMAMLANDI">Tamamlandı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Proje Bilgileri</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Kategori Seçin</option>
                  <option value="Güçlendirme">Güçlendirme</option>
                  <option value="Paket İş">Paket İş</option>
                  <option value="Kentsel Dönüşüm">Kentsel Dönüşüm</option>
                  <option value="Performans Analizi">Performans Analizi</option>
                  <option value="Danışmanlık">Danışmanlık</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    İl
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="İl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    İlçe
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="İlçe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mıntıka
                  </label>
                  <input
                    type="text"
                    name="mintika"
                    value={formData.mintika || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="Mıntıka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Müşteri Adı
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="Müşteri adı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ada
                  </label>
                  <input
                    type="text"
                    name="ada"
                    value={formData.ada || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="Ada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Parsel
                  </label>
                  <input
                    type="text"
                    name="parsel"
                    value={formData.parsel || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="Parsel"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Künye Bilgileri</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Şantiye Şefi
                </label>
                <input
                  type="text"
                  name="siteManager"
                  value={formData.siteManager || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Şantiye şefi adı..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sorumlu Mühendis
                </label>
                <input
                  type="text"
                  name="engineer"
                  value={formData.engineer || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Mühendis adı..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mimar
                </label>
                <input
                  type="text"
                  name="architect"
                  value={formData.architect || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Mimar adı..."
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Mesai Saatleri</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mesai Başlangıç
                  </label>
                  <input
                    type="time"
                    name="shiftStart"
                    value={formData.shiftStart || "08:00"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mesai Bitiş
                  </label>
                  <input
                    type="time"
                    name="shiftEnd"
                    value={formData.shiftEnd || "17:00"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
