"use client"

import { useState, useEffect } from "react"

export default function AdminSettingsPage() {
  const [driveFolderId, setDriveFolderId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Profession management state
  const [professions, setProfessions] = useState<any[]>([])
  const [newProfession, setNewProfession] = useState("")
  const [isAddingProfession, setIsAddingProfession] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchProfessions()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setDriveFolderId(data.driveFolderId || "")
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfessions = async () => {
    try {
      const response = await fetch("/api/admin/professions")
      if (response.ok) {
        const data = await response.json()
        setProfessions(data)
      }
    } catch (error) {
      console.error("Failed to fetch professions:", error)
    }
  }

  const handleAddProfession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfession.trim()) return

    setIsAddingProfession(true)
    try {
      const response = await fetch("/api/admin/professions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProfession.trim() })
      })

      if (response.ok) {
        setNewProfession("")
        fetchProfessions()
      } else {
        alert("Meslek eklenirken hata oluştu")
      }
    } catch (error) {
      alert("Hata oluştu")
    } finally {
      setIsAddingProfession(false)
    }
  }

  const handleDeleteProfession = async (id: string) => {
    if (!confirm("Bu mesleği silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/professions/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchProfessions()
      } else {
        const data = await response.json()
        alert(data.error || "Meslek silinirken hata oluştu")
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveFolderId })
      })

      if (response.ok) {
        alert("Ayarlar kaydedildi")
      } else {
        alert("Hata oluştu")
      }
    } catch (error) {
      alert("Hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        Ayarlar
      </h1>

      <div className="space-y-8">
        {/* Google Drive Settings */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Google Drive Arşiv Ayarları</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Google Drive Klasör ID / Linki
              </label>
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                placeholder="https://drive.google.com/drive/folders/..."
                disabled={isLoading}
              />
              <p className="text-sm text-slate-400 mt-2">
                PDF dosyalarının yükleneceği Google Drive klasörünün ID'si veya tam linki.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {/* Profession Management */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Birim / Meslek Yönetimi</h2>
          
          {/* Add New Profession Form */}
          <form onSubmit={handleAddProfession} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={newProfession}
                onChange={(e) => setNewProfession(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                placeholder="Yeni meslek adı (Örn: Kalıpçı, Elektrikçi)"
                disabled={isAddingProfession}
              />
              <button
                type="submit"
                disabled={isAddingProfession || !newProfession.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
              >
                {isAddingProfession ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>
          </form>

          {/* Professions List */}
          <div className="space-y-2">
            {professions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Henüz meslek eklenmedi</p>
            ) : (
              professions.map((prof) => (
                <div
                  key={prof.id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <span className="text-white">{prof.name}</span>
                  <button
                    onClick={() => handleDeleteProfession(prof.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
