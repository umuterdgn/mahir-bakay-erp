"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { QRCodeSVG } from "qrcode.react"
import * as XLSX from "xlsx"

export default function AttendancePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [visitorRecords, setVisitorRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("Tüm Takımlar")
  
  // QR Code state
  const [selectedProjectForQR, setSelectedProjectForQR] = useState("")
  const [showQRModal, setShowQRModal] = useState(false)
  
  // Worker form state
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false)
  const [workerForm, setWorkerForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    team: "",
    projectId: ""
  })

  // Manual attendance form state
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = useState(false)
  const [manualAttendanceForm, setManualAttendanceForm] = useState({
    workerId: "",
    projectId: "",
    checkInTime: "",
    checkOutTime: ""
  })
  const [workerSearchTerm, setWorkerSearchTerm] = useState("")
  const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState(false)

  // Turkish character normalization function
  const normalizeTurkishChars = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
  }

  useEffect(() => {
    fetchProjects()
    fetchWorkers()
    fetchAttendanceRecords()
    fetchVisitorRecords()
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
    }
  }

  const fetchWorkers = async () => {
    try {
      const response = await fetch("/api/admin/workers")
      if (response.ok) {
        const data = await response.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error("Failed to fetch workers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/admin/attendance-records")
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data)
      }
    } catch (error) {
      console.error("Failed to fetch attendance records:", error)
    }
  }

  const fetchVisitorRecords = async () => {
    try {
      const response = await fetch("/api/attendance/visitor")
      if (response.ok) {
        const data = await response.json()
        setVisitorRecords(data)
      }
    } catch (error) {
      console.error("Failed to fetch visitor records:", error)
    }
  }

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workerForm.firstName || !workerForm.lastName || !workerForm.username || !workerForm.password || !workerForm.projectId) {
      toast.error("Tüm zorunlu alanları doldurun")
      return
    }

    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(workerForm)
      })

      if (response.ok) {
        toast.success("İşçi başarıyla eklendi")
        fetchWorkers()
        setIsWorkerModalOpen(false)
        setWorkerForm({
          firstName: "",
          lastName: "",
          username: "",
          password: "",
          team: "",
          projectId: ""
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "İşçi eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("İşçi eklenirken hata oluştu")
    }
  }

  const handleManualAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualAttendanceForm.workerId || !manualAttendanceForm.projectId) {
      toast.error("Personel ve proje seçiniz")
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch("/api/admin/attendance-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workerId: manualAttendanceForm.workerId,
          projectId: manualAttendanceForm.projectId,
          date: today,
          checkIn: manualAttendanceForm.checkInTime ? `${today}T${manualAttendanceForm.checkInTime}` : null,
          checkOut: manualAttendanceForm.checkOutTime ? `${today}T${manualAttendanceForm.checkOutTime}` : null,
          dayMultiplier: 1 // Default to full day for now
        })
      })

      if (response.ok) {
        toast.success("Yoklama başarıyla eklendi")
        fetchAttendanceRecords()
        setIsManualAttendanceOpen(false)
        setManualAttendanceForm({
          workerId: "",
          projectId: "",
          checkInTime: "",
          checkOutTime: ""
        })
        setWorkerSearchTerm("")
      } else {
        toast.error("Yoklama eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Yoklama eklenirken hata oluştu")
    }
  }

  const exportAttendanceToExcel = () => {
    const data = attendanceRecords.map(record => ({
      "İşçi Adı": `${record.worker?.firstName} ${record.worker?.lastName}`,
      "Kullanıcı Adı": record.worker?.username,
      "Takım": record.worker?.team,
      "Tarih": new Date(record.date).toLocaleDateString("tr-TR"),
      "Giriş Saati": record.checkIn ? new Date(record.checkIn).toLocaleTimeString("tr-TR") : "-",
      "Çıkış Saati": record.checkOut ? new Date(record.checkOut).toLocaleTimeString("tr-TR") : "-",
      "Proje": record.project?.name || record.project?.title
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Yoklamalar")
    XLSX.writeFile(wb, "personel_yoklamalari.xlsx")
    toast.success("Excel dosyası indirildi")
  }

  const exportVisitorsToExcel = () => {
    const data = visitorRecords.map(record => ({
      "Ad Soyad": record.fullName,
      "Firma": record.company || "-",
      "Ziyaret Sebebi": record.reason || "-",
      "Giriş Zamanı": new Date(record.checkIn).toLocaleString("tr-TR"),
      "Çıkış Zamanı": record.checkOut ? new Date(record.checkOut).toLocaleString("tr-TR") : "-",
      "Proje": record.project?.name || record.project?.title
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ziyaretçiler")
    XLSX.writeFile(wb, "ziyaretci_kayitlari.xlsx")
    toast.success("Excel dosyası indirildi")
  }

  const handleGenerateQR = () => {
    if (!selectedProjectForQR) {
      toast.error("Lütfen bir proje seçin")
      return
    }
    setShowQRModal(true)
  }

  const handleVisitorCheckout = async (visitorId: string) => {
    try {
      const response = await fetch(`/api/attendance/visitor/${visitorId}`, {
        method: "PATCH"
      })

      if (response.ok) {
        toast.success("Ziyaretçi çıkışı yapıldı")
        fetchVisitorRecords()
      } else {
        toast.error("Çıkış yapılırken hata oluştu")
      }
    } catch (error) {
      toast.error("Çıkış yapılırken hata oluştu")
    }
  }

  const getCheckInURL = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    const shiftStart = project?.shiftStart || "08:00"
    const shiftEnd = project?.shiftEnd || "17:00"
    
    // Create a JSON object with project info
    const qrData = JSON.stringify({
      projectId,
      shiftStart,
      shiftEnd,
      projectName: project?.name || project?.title || "Proje"
    })
    
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/check-in/${projectId}?data=${encodeURIComponent(qrData)}`
    }
    return `/check-in/${projectId}?data=${encodeURIComponent(qrData)}`
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
          Puantaj & Personel
        </h1>
      </div>

      {/* QR Code Generator Section */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">📱 Şantiye QR'ı Oluştur</h2>
        <div className="flex gap-4">
          <select
            value={selectedProjectForQR}
            onChange={(e) => setSelectedProjectForQR(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Proje Seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateQR}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            QR Oluştur
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setIsWorkerModalOpen(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
        >
          + Yeni İşçi Ekle
        </button>
        <button
          onClick={() => setIsManualAttendanceOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
        >
          📝 Manuel Yoklama Girişi
        </button>
        <div className="flex gap-2">
          <button
            onClick={exportAttendanceToExcel}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
          >
            📊 Yoklamaları İndir
          </button>
          <button
            onClick={exportVisitorsToExcel}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
          >
            📊 Ziyaretçileri İndir
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">👷 İşçiler</h2>
          <div className="flex gap-2">
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            >
              <option value="Tüm Takımlar">Tüm Takımlar</option>
              <option value="Demirci">Demirci</option>
              <option value="Kalıpçı">Kalıpçı</option>
              <option value="Betoncu">Betoncu</option>
              <option value="İnşaat İşçisi">İnşaat İşçisi</option>
              <option value="Marangoz">Marangoz</option>
              <option value="Elektrikçi">Elektrikçi</option>
              <option value="Tesisatçı">Tesisatçı</option>
              <option value="Sıvacı">Sıvacı</option>
              <option value="Boyacı">Boyacı</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ad Soyad</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Kullanıcı Adı</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Takım</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Proje</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Henüz işçi kaydı yok
                  </td>
                </tr>
              ) : (
                workers
                  .filter(worker => selectedTeamFilter === "Tüm Takımlar" || worker.team === selectedTeamFilter)
                  .map((worker) => (
                  <tr key={worker.id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white">
                      {worker.firstName} {worker.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{worker.username}</td>
                    <td className="py-3 px-4 text-slate-300">{worker.team}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {worker.project?.name || worker.project?.title}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 Personel Yoklamaları</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">İşçi</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Tarih</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Giriş</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Çıkış</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Henüz yoklama kaydı yok
                  </td>
                </tr>
              ) : (
                attendanceRecords.slice(0, 10).map((record) => (
                  <tr key={record.id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white">
                      {record.worker?.firstName} {record.worker?.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(record.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="py-3 px-4 text-green-400">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString("tr-TR") : "-"}
                    </td>
                    <td className="py-3 px-4 text-red-400">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString("tr-TR") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Records Table */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">👤 Ziyaretçi Kayıtları</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ad Soyad</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Firma</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Sebep</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Giriş</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Çıkış</th>
              </tr>
            </thead>
            <tbody>
              {visitorRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Henüz ziyaretçi kaydı yok
                  </td>
                </tr>
              ) : (
                visitorRecords.slice(0, 10).map((record) => (
                  <tr key={record.id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white">{record.fullName}</td>
                    <td className="py-3 px-4 text-slate-300">{record.company || "-"}</td>
                    <td className="py-3 px-4 text-slate-300">{record.reason || "-"}</td>
                    <td className="py-3 px-4 text-green-400">
                      {new Date(record.checkIn).toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3 px-4 text-red-400">
                      {record.checkOut ? (
                        new Date(record.checkOut).toLocaleString("tr-TR")
                      ) : (
                        <button
                          onClick={() => handleVisitorCheckout(record.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                        >
                          Çıkış Yap
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Yeni İşçi Ekle</h3>
            
            <form onSubmit={handleWorkerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ad *</label>
                  <input
                    type="text"
                    value={workerForm.firstName}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Soyad *</label>
                  <input
                    type="text"
                    value={workerForm.lastName}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Adı *</label>
                <input
                  type="text"
                  value={workerForm.username}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Örn: ahmet.yilmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre *</label>
                <input
                  type="password"
                  value={workerForm.password}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Takım</label>
                <input
                  type="text"
                  value={workerForm.team}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, team: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Örn: Demirciler"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje *</label>
                <select
                  value={workerForm.projectId}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  required
                >
                  <option value="">Proje Seçin</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {isManualAttendanceOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Manuel Yoklama Girişi</h3>
            
            <form onSubmit={handleManualAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Personel Ara/Seç *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={workerSearchTerm}
                    onChange={(e) => {
                      setWorkerSearchTerm(e.target.value)
                      setIsWorkerDropdownOpen(true)
                    }}
                    onFocus={() => setIsWorkerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsWorkerDropdownOpen(false), 200)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="İsim veya takım ara..."
                    required
                  />
                  {isWorkerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                      {workers
                        .filter(w => {
                          if (workerSearchTerm === "") return true
                          const searchTerm = normalizeTurkishChars(workerSearchTerm)
                          const firstName = normalizeTurkishChars(w.firstName)
                          const lastName = normalizeTurkishChars(w.lastName)
                          const team = normalizeTurkishChars(w.team)
                          return firstName.includes(searchTerm) || 
                                 lastName.includes(searchTerm) || 
                                 team.includes(searchTerm)
                        })
                        .slice(0, 10)
                        .map((worker) => (
                        <div
                          key={worker.id}
                          onClick={() => {
                            setManualAttendanceForm(prev => ({ ...prev, workerId: worker.id }))
                            setWorkerSearchTerm(`${worker.firstName} ${worker.lastName} - ${worker.team}`)
                            setIsWorkerDropdownOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-white text-sm"
                        >
                          {worker.firstName} {worker.lastName} - {worker.team}
                        </div>
                      ))}
                      {workers.filter(w => {
                        if (workerSearchTerm === "") return true
                        const searchTerm = normalizeTurkishChars(workerSearchTerm)
                        const firstName = normalizeTurkishChars(w.firstName)
                        const lastName = normalizeTurkishChars(w.lastName)
                        const team = normalizeTurkishChars(w.team)
                        return firstName.includes(searchTerm) || 
                               lastName.includes(searchTerm) || 
                               team.includes(searchTerm)
                      }).length === 0 && (
                        <div className="px-4 py-2 text-slate-500 text-sm">
                          Sonuç bulunamadı
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje *</label>
                <select
                  value={manualAttendanceForm.projectId}
                  onChange={(e) => setManualAttendanceForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  <option value="">Proje Seçin</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Giriş Saati</label>
                  <input
                    type="time"
                    value={manualAttendanceForm.checkInTime}
                    onChange={(e) => setManualAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Çıkış Saati</label>
                  <input
                    type="time"
                    value={manualAttendanceForm.checkOutTime}
                    onChange={(e) => setManualAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsManualAttendanceOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Şantiye QR'ı</h3>
            
            <div className="flex justify-center mb-6">
              <QRCodeSVG
                value={getCheckInURL(selectedProjectForQR)}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-center text-slate-400 text-sm mb-4">
              {getCheckInURL(selectedProjectForQR)}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Yazdır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}