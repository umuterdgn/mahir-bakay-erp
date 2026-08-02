"use client"

import { useState, useEffect } from "react"

export default function AdminSettingsPage() {
  const [driveFolderId, setDriveFolderId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
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
    </div>
  )
}
