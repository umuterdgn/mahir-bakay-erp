"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

export default function TasksPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [selectedWorkerId, setSelectedWorkerId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    dueDate: ""
  })

  useEffect(() => {
    fetchProjects()
    fetchWorkers()
    fetchAllTasks()
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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkers = async () => {
    try {
      const response = await fetch("/api/admin/personnel")
      if (response.ok) {
        const data = await response.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error("Failed to fetch personnel:", error)
    }
  }

  const fetchAllTasks = async () => {
    try {
      const response = await fetch("/api/admin/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error("Başlık zorunludur")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId || null,
          assignedTo: formData.assignedTo || null,
          dueDate: formData.dueDate || null
        })
      })

      if (response.ok) {
        toast.success("Görev başarıyla eklendi")
        fetchAllTasks()
        closeModal()
      } else {
        toast.error("Görev eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Görev eklenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success("Görev durumu güncellendi")
        fetchAllTasks()
      } else {
        toast.error("Görev durumu güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Görev durumu güncellenirken hata oluştu")
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Görev silindi")
        fetchAllTasks()
      } else {
        toast.error("Görev silinirken hata oluştu")
      }
    } catch (error) {
      toast.error("Görev silinirken hata oluştu")
    }
  }

  const handleEdit = (task: any) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      projectId: task.projectId || "",
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error("Başlık zorunludur")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          projectId: formData.projectId || null,
          assignedTo: formData.assignedTo || null,
          dueDate: formData.dueDate || null
        })
      })

      if (response.ok) {
        toast.success("Görev güncellendi")
        fetchAllTasks()
        closeEditModal()
      } else {
        toast.error("Görev güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Görev güncellenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
    setFormData({
      title: "",
      description: "",
      projectId: "",
      assignedTo: "",
      dueDate: ""
    })
  }

  const openModal = () => {
    setFormData({
      title: "",
      description: "",
      projectId: selectedProjectId,
      assignedTo: "",
      dueDate: ""
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      title: "",
      description: "",
      projectId: selectedProjectId,
      assignedTo: "",
      dueDate: ""
    })
  }

  const filteredTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks.filter(task => !selectedWorkerId || task.assignedTo === selectedWorkerId)

  const todoTasks = filteredTasks.filter(task => task.status === "TODO")
  const inProgressTasks = filteredTasks.filter(task => task.status === "IN_PROGRESS")
  const inReviewTasks = filteredTasks.filter(task => task.status === "IN_REVIEW")
  const doneTasks = filteredTasks.filter(task => task.status === "DONE")

  const isTaskOverdue = (task: any) => {
    if (!task.dueDate || task.status === "DONE") return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
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
          📋 Kanban Görev Panosu
        </h1>
        <button
          onClick={openModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Görev Ekle
        </button>
      </div>

      {/* Project and Worker Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <label className="block text-sm font-medium text-slate-300 mb-2">Proje Filtrele</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Tüm Projeler</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <label className="block text-sm font-medium text-slate-300 mb-2">Personel Filtrele</label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Tüm Personel</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* TODO Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
              Yapılacaklar
              <span className="text-slate-400 text-sm">({todoTasks.length})</span>
            </h2>
          </div>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateStatus}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOverdue={isTaskOverdue(task)}
              />
            ))}
            {todoTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Görev yok
              </div>
            )}
          </div>
        </div>

        {/* IN_PROGRESS Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Devam Edenler
              <span className="text-slate-400 text-sm">({inProgressTasks.length})</span>
            </h2>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateStatus}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOverdue={isTaskOverdue(task)}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Görev yok
              </div>
            )}
          </div>
        </div>

        {/* IN_REVIEW Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Kontrol Bekleyenler
              <span className="text-slate-400 text-sm">({inReviewTasks.length})</span>
            </h2>
          </div>
          <div className="space-y-3">
            {inReviewTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateStatus}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOverdue={isTaskOverdue(task)}
              />
            ))}
            {inReviewTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Görev yok
              </div>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Tamamlananlar
              <span className="text-slate-400 text-sm">({doneTasks.length})</span>
            </h2>
          </div>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateStatus}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOverdue={false}
              />
            ))}
            {doneTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Görev yok
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Görev Düzenle</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje (Opsiyonel)</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Atanan Kişi (Opsiyonel)</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Kişi Seçin</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.firstName} {worker.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Son Tarih (Opsiyonel)</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Yeni Görev Ekle</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje (Opsiyonel)</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Atanan Kişi (Opsiyonel)</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Kişi Seçin</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.firstName} {worker.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Son Tarih (Opsiyonel)</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onStatusChange, onDelete, isOverdue, onEdit }: any) {
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "TODO": return "IN_PROGRESS"
      case "IN_PROGRESS": return "IN_REVIEW"
      case "IN_REVIEW": return "DONE"
      case "DONE": return "TODO"
      default: return "TODO"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO": return "bg-slate-700"
      case "IN_PROGRESS": return "bg-blue-900/30 border-blue-800"
      case "IN_REVIEW": return "bg-yellow-900/30 border-yellow-800"
      case "DONE": return "bg-green-900/30 border-green-800"
      default: return "bg-slate-700"
    }
  }

  const getButtonLabel = (status: string) => {
    switch (status) {
      case "TODO": return "Başla →"
      case "IN_PROGRESS": return "Kontrol →"
      case "IN_REVIEW": return "Onayla →"
      case "DONE": return "Yeniden"
      default: return "İleri →"
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(task.status)} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-medium text-sm flex-1">{task.title}</h3>
        {isOverdue && (
          <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded-full font-medium whitespace-nowrap">
            Süresi Geçmiş
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        {task.project && (
          <span className="bg-slate-800 px-2 py-1 rounded">
            {task.project.name || task.project.title}
          </span>
        )}
        {task.worker && (
          <span className="bg-slate-800 px-2 py-1 rounded">
            {task.worker.name}
          </span>
        )}
        {task.dueDate && (
          <span className={isOverdue ? "text-red-400" : ""}>
            {new Date(task.dueDate).toLocaleDateString("tr-TR")}
          </span>
        )}
      </div>

      {/* Onay Butonları (IN_REVIEW durumu için) */}
      {task.status === "IN_REVIEW" && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onStatusChange(task.id, "DONE")}
            className="flex-1 px-2 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded transition-colors"
          >
            ✓ Onayla
          </button>
          <button
            onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
            className="flex-1 px-2 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-xs rounded transition-colors"
          >
            ← Geri Gönder
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {task.status !== "IN_REVIEW" && (
          <button
            onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
            className="flex-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
          >
            {getButtonLabel(task.status)}
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="px-2 py-1.5 bg-blue-900/50 hover:bg-blue-900 text-blue-400 text-xs rounded transition-colors"
        >
          Düzenle
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-2 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 text-xs rounded transition-colors"
        >
          Sil
        </button>
      </div>
    </div>
  )
}
