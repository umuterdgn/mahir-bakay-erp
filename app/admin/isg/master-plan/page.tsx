"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Map, ChevronDown } from "lucide-react"

const SiteMasterPlan = dynamic(() => import("@/components/SiteMasterPlan"), { 
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Harita yükleniyor...</div>
});

interface Project {
  id: string
  name: string
  title: string
  latitude: number | null
  longitude: number | null
  city: string | null
  district: string | null
}

export default function ISGMasterPlanPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        // Auto-select the first project (most recent due to createdAt: 'desc' in API)
        if (data && data.length > 0) {
          setSelectedProject(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (!selectedProject) {
    return (
      <div className="p-6">
        <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-800 p-8 text-center">
          <Map className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Proje Bulunamadı</h3>
          <p className="text-slate-400">Sistemde kayıtlı proje bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Map className="w-8 h-8 text-blue-400" />
          Vaziyet ve Risk Planı
        </h1>
        <p className="text-slate-400 mt-1">Proje bazlı şantiye alanı ve risk bölgesi yönetimi</p>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Proje Seç</label>
        <div className="relative">
          <select
            value={selectedProject.id}
            onChange={handleProjectChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title}
                {project.city && project.district && ` - ${project.city}/${project.district}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Site Master Plan */}
      {selectedProject.latitude && selectedProject.longitude ? (
        <SiteMasterPlan
          projectLat={selectedProject.latitude}
          projectLng={selectedProject.longitude}
          projectId={selectedProject.id}
        />
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-800 p-8 text-center">
          <Map className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Konum Bilgisi Eksik</h3>
          <p className="text-slate-400">Seçilen proje için konum bilgisi (enlem/boylam) tanımlanmamıştır.</p>
        </div>
      )}
    </div>
  )
}
