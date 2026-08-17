"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectFiles from "@/components/ProjectFiles"
import ProjectReminders from "@/components/ProjectReminders"
import ProjectDailyLogs from "@/components/ProjectDailyLogs"
import { toast } from "react-hot-toast"

interface Project {
  id: string
  name: string | null
  title: string | null
  city: string | null
  district: string | null
  mintika: string | null
  ada: string | null
  parsel: string | null
  clientName: string | null
  siteManager: string | null
  engineer: string | null
  architect: string | null
  status: string | null
  startDate: string
  endDate: string | null
  mapUrl: string | null
  company: { name: string } | null
  shiftStart: string | null
  shiftEnd: string | null
}

interface ProjectDetailTabsProps {
  project: Project
}

export default function ProjectDetailTabs({ project }: ProjectDetailTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("kunya")
  const [isEditing, setIsEditing] = useState(false)
  const [isTkgmModalOpen, setIsTkgmModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [inspectionReports, setInspectionReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [editForm, setEditForm] = useState({
    city: project.city || "",
    district: project.district || "",
    mintika: project.mintika || "",
    ada: project.ada || "",
    parsel: project.parsel || "",
    clientName: project.clientName || "",
    siteManager: project.siteManager || "",
    engineer: project.engineer || "",
    architect: project.architect || "",
    mapUrl: project.mapUrl || "",
    shiftStart: project.shiftStart || "",
    shiftEnd: project.shiftEnd || ""
  })

  const tabs = [
    { id: "kunya", label: "Proje Künyesi" },
    { id: "arsiv", label: "Arşiv ve Evraklar" },
    { id: "gunluk", label: "Şantiye Günlüğü" },
    { id: "denetim", label: "Yapı Denetim Arşivi" },
    { id: "hatirlatici", label: "Hatırlatıcılar" }
  ]

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success("Proje bilgileri güncellendi")
        setIsEditing(false)
        window.location.reload()
      } else {
        toast.error("Güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Güncellenirken hata oluştu")
    }
  }

  // Fetch inspection reports when denetim tab is active
  useEffect(() => {
    if (activeTab === "denetim") {
      fetchInspectionReports()
    }
  }, [activeTab])

  const fetchInspectionReports = async () => {
    setLoadingReports(true)
    try {
      const response = await fetch(`/api/admin/inspection-reports?projectId=${project.id}`)
      if (response.ok) {
        const data = await response.json()
        setInspectionReports(data)
      }
    } catch (error) {
      console.error("Failed to fetch inspection reports:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Bu raporu silmek istediğinize emin misiniz?")) return;
    
    try {
      const res = await fetch(`/api/inspection/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Rapor silindi.");
        setInspectionReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        toast.error("Rapor silinemedi.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Rapor silinirken hata oluştu.");
    }
  };

  const handleEditReport = async (reportId: string, currentTitle: string, currentDescription: string) => {
    const newTitle = window.prompt("Yeni Başlık:", currentTitle);
    if (newTitle === null) return; // User cancelled
    
    const newDescription = window.prompt("Yeni Açıklama:", currentDescription || "");
    if (newDescription === null) return; // User cancelled
    
    try {
      const res = await fetch(`/api/inspection/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription })
      });
      
      if (res.ok) {
        toast.success("Rapor güncellendi.");
        setInspectionReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, title: newTitle, description: newDescription } : r
        ));
      } else {
        toast.error("Rapor güncellenemedi.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Rapor güncellenirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "kunya" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Proje Künyesi</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                >
                  Projeyi Düzenle
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">İl</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">İlçe</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mıntıka</label>
                    <input
                      type="text"
                      value={editForm.mintika}
                      onChange={(e) => setEditForm({ ...editForm, mintika: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ada</label>
                    <input
                      type="text"
                      value={editForm.ada}
                      onChange={(e) => setEditForm({ ...editForm, ada: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Parsel</label>
                    <input
                      type="text"
                      value={editForm.parsel}
                      onChange={(e) => setEditForm({ ...editForm, parsel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Müşteri Adı</label>
                    <input
                      type="text"
                      value={editForm.clientName}
                      onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Şantiye Şefi</label>
                    <input
                      type="text"
                      value={editForm.siteManager}
                      onChange={(e) => setEditForm({ ...editForm, siteManager: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sorumlu Mühendis</label>
                    <input
                      type="text"
                      value={editForm.engineer}
                      onChange={(e) => setEditForm({ ...editForm, engineer: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mimar</label>
                    <input
                      type="text"
                      value={editForm.architect}
                      onChange={(e) => setEditForm({ ...editForm, architect: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Google Maps URL</label>
                    <input
                      type="text"
                      value={editForm.mapUrl}
                      onChange={(e) => setEditForm({ ...editForm, mapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mesai Başlangıç</label>
                    <input
                      type="time"
                      value={editForm.shiftStart}
                      onChange={(e) => setEditForm({ ...editForm, shiftStart: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mesai Bitiş</label>
                    <input
                      type="time"
                      value={editForm.shiftEnd}
                      onChange={(e) => setEditForm({ ...editForm, shiftEnd: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Location Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-white">Konum Bilgileri</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {project.city && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">İl</label>
                        <p className="text-white font-medium">{project.city}</p>
                      </div>
                    )}
                    {project.district && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">İlçe</label>
                        <p className="text-white font-medium">{project.district}</p>
                      </div>
                    )}
                    {project.mintika && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Mıntıka</label>
                        <p className="text-white font-medium">{project.mintika}</p>
                      </div>
                    )}
                    {project.ada && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Ada</label>
                        <p className="text-white font-medium">{project.ada}</p>
                      </div>
                    )}
                    {project.parsel && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Parsel</label>
                        <p className="text-white font-medium">{project.parsel}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {project.mapUrl && (
                      <a
                        href={project.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Google Maps'te Aç
                      </a>
                    )}
                    <button
                      onClick={() => setIsTkgmModalOpen(true)}
                      className="flex items-center justify-center gap-2 flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      TKGM Parsel Sorgula
                    </button>
                  </div>
                </div>

                {/* Other Project Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  {project.clientName && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Müşteri</label>
                      <p className="text-white font-medium">{project.clientName}</p>
                    </div>
                  )}
                  {project.siteManager && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Şantiye Şefi</label>
                      <p className="text-white font-medium">{project.siteManager}</p>
                    </div>
                  )}
                  {project.engineer && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Sorumlu Mühendis</label>
                      <p className="text-white font-medium">{project.engineer}</p>
                    </div>
                  )}
                  {project.architect && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Mimar</label>
                      <p className="text-white font-medium">{project.architect}</p>
                    </div>
                  )}
                  {project.company && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Firma</label>
                      <p className="text-white font-medium">{project.company.name}</p>
                    </div>
                  )}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Başlangıç Tarihi</label>
                    <p className="text-white font-medium">{new Date(project.startDate).toLocaleDateString("tr-TR")}</p>
                  </div>
                  {project.endDate && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Bitiş Tarihi</label>
                      <p className="text-white font-medium">{new Date(project.endDate).toLocaleDateString("tr-TR")}</p>
                    </div>
                  )}
                  {(project.shiftStart || project.shiftEnd) && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Mesai Saatleri</label>
                      <p className="text-white font-medium">
                        {project.shiftStart || "--:--"} - {project.shiftEnd || "--:--"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "arsiv" && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <ProjectFiles projectId={project.id} />
          </div>
        )}

        {activeTab === "gunluk" && (
          <div className="space-y-4">
            <div className="bg-red-900/20 border-2 border-red-600 rounded-xl p-6">
              <button
                onClick={() => router.push(`/admin/projects/${project.id}/markup`)}
                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Yapı Denetim / Hasar Tespit Çizimi Yap
              </button>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <ProjectDailyLogs projectId={project.id} />
            </div>
          </div>
        )}

        {activeTab === "denetim" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Yapı Denetim Raporları</h3>
              <button
                onClick={() => router.push(`/admin/projects/${project.id}/markup`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Rapor Oluştur
              </button>
            </div>

            {loadingReports ? (
              <div className="text-center text-slate-400 py-8">Yükleniyor...</div>
            ) : inspectionReports.length === 0 ? (
              <div className="text-center text-slate-500 py-8 bg-slate-800 rounded-xl border border-slate-700">
                Henüz yapı denetim raporu yok
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspectionReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="group relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => {
                      setSelectedReport(report)
                      setIsReportModalOpen(true)
                    }}
                  >
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditReport(report.id, report.title || "", report.description || "");
                        }}
                        className="p-1.5 bg-blue-600/80 text-white rounded hover:bg-blue-600 transition"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(report.id);
                        }}
                        className="p-1.5 bg-red-600/80 text-white rounded hover:bg-red-600 transition"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="aspect-video bg-slate-900 relative">
                      {report.markedBlueprintUrl || report.markedPhotoUrl ? (
                        <div className="grid grid-cols-2 h-full">
                          {report.markedBlueprintUrl && (
                            <img
                              src={report.markedBlueprintUrl}
                              alt="İşaretlenmiş Plan"
                              className="w-full h-full object-cover"
                            />
                          )}
                          {report.markedPhotoUrl && (
                            <img
                              src={report.markedPhotoUrl}
                              alt="İşaretlenmiş Fotoğraf"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt="Denetim Raporu"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                          Görsel yok
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        <div className="flex gap-2">
                          {report.markedBlueprintUrl && (
                            <a
                              href={report.markedBlueprintUrl}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Plan
                            </a>
                          )}
                          {report.markedPhotoUrl && (
                            <a
                              href={report.markedPhotoUrl}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Fotoğraf
                            </a>
                          )}
                          {report.imageUrl && !report.markedBlueprintUrl && !report.markedPhotoUrl && (
                            <a
                              href={report.imageUrl}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              İndir
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-white text-sm line-clamp-3">
                        {report.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "hatirlatici" && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <ProjectReminders projectId={project.id} />
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {isReportModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-4xl shadow-2xl border border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Yapı Denetim Raporu Detayı
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-4">
                <span className="text-sm text-slate-400">
                  {new Date(selectedReport.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <div className="mb-6">
                {selectedReport.markedBlueprintUrl || selectedReport.markedPhotoUrl ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.markedBlueprintUrl && (
                      <div>
                        <img
                          src={selectedReport.markedBlueprintUrl}
                          alt="İşaretlenmiş Plan"
                          className="w-full rounded-lg"
                        />
                        <p className="text-sm text-slate-400 mt-2 text-center">İşaretlenmiş Plan</p>
                      </div>
                    )}
                    {selectedReport.markedPhotoUrl && (
                      <div>
                        <img
                          src={selectedReport.markedPhotoUrl}
                          alt="İşaretlenmiş Fotoğraf"
                          className="w-full rounded-lg"
                        />
                        <p className="text-sm text-slate-400 mt-2 text-center">İşaretlenmiş Fotoğraf</p>
                      </div>
                    )}
                  </div>
                ) : selectedReport.imageUrl ? (
                  <img
                    src={selectedReport.imageUrl}
                    alt="Denetim Raporu"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg text-slate-500">
                    Görsel yok
                  </div>
                )}
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Açıklama</h4>
                <p className="text-white">{selectedReport.description}</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF Olarak İndir
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TKGM Modal */}
      {isTkgmModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-6xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                TKGM Parsel Sorgu
              </h3>
              <button
                onClick={() => setIsTkgmModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-emerald-900/20 border-b border-emerald-800">
              <p className="text-emerald-400 font-bold text-lg text-center">
                {project.city?.toUpperCase() || ""}, {project.district?.toUpperCase() || ""} - ADA: {project.ada?.toUpperCase() || ""}, PARSEL: {project.parsel?.toUpperCase() || ""}
              </p>
            </div>
            <div className="p-4">
              <iframe
                src="https://parselsorgu.tkgm.gov.tr/"
                className="w-full h-[75vh] rounded-lg border-0"
                title="TKGM Parsel Sorgu"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsTkgmModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
