"use client"

import { useState, useEffect } from "react"

type TabType = "about" | "services" | "projects"

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>("about")
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        İçerik Yönetimi
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "about"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Hakkımızda
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "services"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Hizmetler
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "projects"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Projeler
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "about" && <AboutSection />}
      {activeTab === "services" && <ServicesSection />}
      {activeTab === "projects" && <ProjectsSection />}
    </div>
  )
}

function AboutSection() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    videoUrl: ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAbout() {
      try {
        const response = await fetch("/api/admin/about")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setFormData({
              title: data.title || "",
              content: data.content || "",
              videoUrl: data.videoUrl || ""
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch about content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAbout()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        alert("Hakkımızda içeriği güncellendi")
      }
    } catch (error) {
      alert("Hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-xl font-semibold text-white mb-6">Hakkımızda İçeriği</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Başlık
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            placeholder="Hakkımızda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            İçerik
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            placeholder="Şirket hakkında bilgi..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Video URL
          </label>
          <input
            type="text"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            placeholder="/about-video.mp4"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  )
}

function ServicesSection() {
  const [services, setServices] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingService({
      id: "",
      title: "",
      description: "",
      images: [""]
    })
    setIsEditing(true)
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return
    
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Hizmetler</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Hizmet Ekle
        </button>
      </div>

      {isEditing ? (
        <ServiceForm
          service={editingService}
          onSave={(service: any) => {
            fetchServices()
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Başlık</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Açıklama</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {services.map((service: any) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 text-sm text-white">{service.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs">{service.description}</td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ServiceForm({ service, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(service)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/services", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        onSave(formData)
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold text-white mb-6">
        {formData.id ? "Hizmet Düzenle" : "Yeni Hizmet"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Görsel URL'leri (virgülle ayırın, max 5)</label>
          <input
            type="text"
            value={formData.images.join(",")}
            onChange={(e) => setFormData({ ...formData, images: e.target.value.split(",").slice(0, 5) })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            placeholder="/images/service1.jpg, /images/service2.jpg"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}

function ProjectsSection() {
  const [projects, setProjects] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
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

  const handleAdd = () => {
    setEditingProject({
      id: "",
      title: "",
      description: "",
      images: [""]
    })
    setIsEditing(true)
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return
    
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Projeler</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Proje Ekle
        </button>
      </div>

      {isEditing ? (
        <ProjectForm
          project={editingProject}
          onSave={(project: any) => {
            fetchProjects()
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Başlık</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Açıklama</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects.map((project: any) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 text-sm text-white">{project.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs">{project.description}</td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProjectForm({ project, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(project)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/projects", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        onSave(formData)
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold text-white mb-6">
        {formData.id ? "Proje Düzenle" : "Yeni Proje"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Görsel URL'leri (virgülle ayırın, max 5)</label>
          <input
            type="text"
            value={formData.images.join(",")}
            onChange={(e) => setFormData({ ...formData, images: e.target.value.split(",").slice(0, 5) })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            placeholder="/images/project1.jpg, /images/project2.jpg"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}