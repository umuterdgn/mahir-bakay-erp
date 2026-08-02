"use client"

import { useState, useEffect } from "react"

export default function AdminArchivePage() {
  const [archives, setArchives] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc">("date-desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchArchives()
  }, [])

  const fetchArchives = async () => {
    try {
      const response = await fetch("/api/admin/archive")
      if (response.ok) {
        const data = await response.json()
        setArchives(data)
      }
    } catch (error) {
      console.error("Failed to fetch archives:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      alert("Sadece PDF dosyaları yüklenebilir")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("projectName", prompt("Proje adı girin:") || "")

      const response = await fetch("/api/admin/archive", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const newArchive = await response.json()
        fetchArchives()
      } else {
        alert("Dosya yüklenirken hata oluştu")
      }
    } catch (error) {
      alert("Dosya yüklenirken hata oluştu")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu arşiv kaydını silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/archive/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchArchives()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  const filteredArchives = archives
    .filter(archive => 
      archive.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(archive => {
      if (!dateRange.start && !dateRange.end) return true
      const archiveDate = new Date(archive.uploadedAt)
      if (dateRange.start && archiveDate < new Date(dateRange.start)) return false
      if (dateRange.end && archiveDate > new Date(dateRange.end)) return false
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt)
      const dateB = new Date(b.uploadedAt)
      return sortBy === "date-asc" 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    })

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        Arşiv Yönetimi
      </h1>

      {/* Upload Section */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">PDF Yükle</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex-1 text-white"
          />
          {isUploading && (
            <span className="text-slate-400">Yükleniyor...</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Proje Adı Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="Proje adı..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date-asc" | "date-desc")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="date-desc">Tarih (Yeniden Eskiye)</option>
              <option value="date-asc">Tarih (Eskiden Yeniye)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Archive List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Proje Adı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Dosya Adı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Yükleme Tarihi</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredArchives.map((archive) => (
              <tr key={archive.id}>
                <td className="px-6 py-4 text-sm text-white">{archive.projectName}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{archive.fileName}</td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(archive.uploadedAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <a
                    href={archive.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    İndir
                  </a>
                  <button
                    onClick={() => handleDelete(archive.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {filteredArchives.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Arşiv kaydı bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}