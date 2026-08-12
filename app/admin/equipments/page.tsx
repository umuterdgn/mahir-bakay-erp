"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    type: "DIGER",
    status: "AKTIF",
    plateOrSerialNo: "",
    nextMaintenance: "",
    projectId: ""
  })

  useEffect(() => {
    fetchEquipments()
    fetchProjects()
  }, [])

  const fetchEquipments = async () => {
    try {
      const response = await fetch("/api/admin/equipments")
      if (response.ok) {
        const data = await response.json()
        setEquipments(data)
      }
    } catch (error) {
      console.error("Failed to fetch equipments:", error)
      toast.error("Demirbaşlar yüklenirken hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error("Demirbaş adı zorunludur")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/equipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("Demirbaş başarıyla eklendi")
        fetchEquipments()
        closeModal()
      } else {
        toast.error("Demirbaş eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Demirbaş eklenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openModal = () => {
    setFormData({
      name: "",
      type: "DIGER",
      status: "AKTIF",
      plateOrSerialNo: "",
      nextMaintenance: "",
      projectId: ""
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      name: "",
      type: "DIGER",
      status: "AKTIF",
      plateOrSerialNo: "",
      nextMaintenance: "",
      projectId: ""
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ARAC": return "Araç"
      case "IS_MAKINESI": return "İş Makinesi"
      case "ELEKTRONIK": return "Elektronik"
      case "DIGER": return "Diğer"
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AKTIF": return "Aktif"
      case "BAKIMDA": return "Bakımda"
      case "ARIZALI": return "Arızalı"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AKTIF": return "bg-green-900/50 text-green-400"
      case "BAKIMDA": return "bg-yellow-900/50 text-yellow-400"
      case "ARIZALI": return "bg-red-900/50 text-red-400"
      default: return "bg-slate-900/50 text-slate-400"
    }
  }

  if (isLoading) {
    return (
      <div className="lg:mt-0 mt-16">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Demirbaş Takibi
        </h1>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Demirbaş Ekle
        </button>
      </div>

      {/* Equipments Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Adı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Tipi</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Plaka/Seri No</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Durumu</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Bakım Tarihi</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Proje/Şantiye</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {equipments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Demirbaş kaydı bulunamadı
                </td>
              </tr>
            ) : (
              equipments.map((equipment) => (
                <tr key={equipment.id}>
                  <td className="px-6 py-4 text-sm text-white font-medium">{equipment.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{getTypeLabel(equipment.type)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{equipment.plateOrSerialNo || "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                      {getStatusLabel(equipment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {equipment.nextMaintenance 
                      ? new Date(equipment.nextMaintenance).toLocaleDateString("tr-TR")
                      : "-"
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {equipment.project?.name || equipment.project?.title || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Yeni Demirbaş Ekle</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Demirbaş Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Demirbaş adı..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipi</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="ARAC">Araç</option>
                  <option value="IS_MAKINESI">İş Makinesi</option>
                  <option value="ELEKTRONIK">Elektronik</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Plaka/Seri No</label>
                <input
                  type="text"
                  name="plateOrSerialNo"
                  value={formData.plateOrSerialNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Plaka veya seri numarası..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Durumu</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="BAKIMDA">Bakımda</option>
                  <option value="ARIZALI">Arızalı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sonraki Bakım Tarihi</label>
                <input
                  type="date"
                  name="nextMaintenance"
                  value={formData.nextMaintenance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje/Şantiye</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Proje Seçin</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
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
