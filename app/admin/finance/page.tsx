"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function FinancePage() {
  const router = useRouter()
  
  // Basit yetki kontrolü (İleride auth modülüne bağlanacak)
  const userPermissions: string[] = [] // Boş ise SUPER_ADMIN olarak kabul edilir
  const isAdmin = userPermissions.length === 0

  if (!isAdmin && !userPermissions.includes("FINANCE")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erişim Engellendi</h1>
          <p className="text-slate-400 mb-6">Bu sayfayı görme yetkiniz yok.</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  const [transactions, setTransactions] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [personnel, setPersonnel] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    type: "GELIR",
    amount: "",
    description: "",
    category: "DIGER",
    projectId: "",
    companyId: "",
    personnelId: ""
  })

  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  })

  const [categoryFilter, setCategoryFilter] = useState("TUMU")

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  })

  useEffect(() => {
    fetchTransactions()
    fetchProjects()
    fetchCompanies()
    fetchPersonnel()
  }, [])

  useEffect(() => {
    const filteredTransactions = getFilteredTransactions()
    
    const income = filteredTransactions
      .filter(t => t.type === "GELIR")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = filteredTransactions
      .filter(t => t.type === "GIDER")
      .reduce((sum, t) => sum + t.amount, 0)
    
    setStats({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense
    })
  }, [transactions, dateFilter, categoryFilter])

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      // Date filtering
      const transactionDate = new Date(t.date)
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null
      
      if (startDate && transactionDate < startDate) return false
      if (endDate && transactionDate > endDate) return false
      
      // Category filtering
      if (categoryFilter !== "TUMU" && t.category !== categoryFilter) return false
      
      return true
    })
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/admin/finance")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      toast.error("İşlemler yüklenirken hata oluştu")
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

  const fetchPersonnel = async () => {
    try {
      const response = await fetch("/api/admin/personnel")
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data)
      }
    } catch (error) {
      console.error("Failed to fetch personnel:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.amount || !formData.description || !formData.category) {
      toast.error("Gerekli alanları doldurun")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("İşlem başarıyla eklendi")
        fetchTransactions()
        closeModal()
      } else {
        toast.error("İşlem eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("İşlem eklenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openModal = () => {
    setFormData({
      type: "GELIR",
      amount: "",
      description: "",
      category: "DIGER",
      projectId: "",
      companyId: "",
      personnelId: ""
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      type: "GELIR",
      amount: "",
      description: "",
      category: "DIGER",
      projectId: "",
      companyId: "",
      personnelId: ""
    })
  }

  const exportToExcel = () => {
    const filteredTransactions = getFilteredTransactions()
    const worksheetData = filteredTransactions.map(t => ({
      "Tarih": new Date(t.date).toLocaleDateString("tr-TR"),
      "Açıklama": t.description,
      "Kategori": t.category,
      "Tutar": t.amount,
      "Tip": t.type === "GELIR" ? "Gelir" : "Gider",
      "Proje": t.project?.name || "-",
      "Firma": t.company?.name || "-",
      "Personel": t.personnel?.name || "-"
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finans İşlemleri")
    XLSX.writeFile(workbook, "finans-raporu.xlsx")
    toast.success("Excel dosyası indirildi")
  }

  const exportToPDF = () => {
    const filteredTransactions = getFilteredTransactions()
    const doc = new jsPDF()
    
    autoTable(doc, {
      head: [["Tarih", "Açıklama", "Kategori", "Tutar", "Tip", "Proje", "Firma", "Personel"]],
      body: filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString("tr-TR"),
        t.description,
        t.category,
        `${t.amount.toLocaleString("tr-TR")} ₺`,
        t.type === "GELIR" ? "Gelir" : "Gider",
        t.project?.name || "-",
        t.company?.name || "-",
        t.personnel?.name || "-"
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 40 }, 2: { cellWidth: 20 }, 3: { cellWidth: 25 }, 4: { cellWidth: 15 }, 5: { cellWidth: 25 }, 6: { cellWidth: 25 }, 7: { cellWidth: 25 } }
    })

    doc.save("finans-raporu.pdf")
    toast.success("PDF dosyası indirildi")
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "MAAS": return "Maaş"
      case "SGK": return "SGK"
      case "HAKEDIS": return "Hakediş"
      case "MALZEME": return "Malzeme"
      case "DEMIR": return "Demir"
      case "BETON": return "Beton"
      case "NAKIYE": return "Nakliye"
      case "YEMEK": return "Yemek"
      case "TASERON": return "Taşeron"
      case "PRIM": return "Prim"
      case "AVANS": return "Avans"
      case "ELDEN": return "Elden"
      case "DIGER": return "Diğer"
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "MAAS": return "bg-blue-900/50 text-blue-400"
      case "SGK": return "bg-purple-900/50 text-purple-400"
      case "HAKEDIS": return "bg-green-900/50 text-green-400"
      case "MALZEME": return "bg-orange-900/50 text-orange-400"
      case "DEMIR": return "bg-red-900/50 text-red-400"
      case "BETON": return "bg-gray-900/50 text-gray-400"
      case "NAKIYE": return "bg-yellow-900/50 text-yellow-400"
      case "YEMEK": return "bg-pink-900/50 text-pink-400"
      case "TASERON": return "bg-teal-900/50 text-teal-400"
      case "PRIM": return "bg-indigo-900/50 text-indigo-400"
      case "AVANS": return "bg-amber-900/50 text-amber-400"
      case "ELDEN": return "bg-cyan-900/50 text-cyan-400"
      case "DIGER": return "bg-slate-900/50 text-slate-400"
      default: return "bg-slate-900/50 text-slate-400"
    }
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Finans Yönetimi
        </h1>
        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
          {/* Date Filter */}
          <div className="flex gap-2 items-center bg-slate-900 rounded-lg p-2 border border-slate-800">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            />
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Temizle
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 items-center bg-slate-900 rounded-lg p-2 border border-slate-800">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            >
              <option value="TUMU">Tümü</option>
              <option value="MAAS">Maaş</option>
              <option value="SGK">SGK</option>
              <option value="HAKEDIS">Hakediş</option>
              <option value="MALZEME">Malzeme</option>
              <option value="DEMIR">Demir</option>
              <option value="BETON">Beton</option>
              <option value="NAKIYE">Nakliye</option>
              <option value="YEMEK">Yemek</option>
              <option value="TASERON">Taşeron</option>
              <option value="PRIM">Prim</option>
              <option value="AVANS">Avans</option>
              <option value="ELDEN">Elden</option>
              <option value="DIGER">Diğer</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
            >
              🟩 Excel İndir
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              🟥 PDF İndir
            </button>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Yeni İşlem Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Toplam Gelir (Hakedişler)</h3>
          <p className="text-3xl font-bold text-green-400">
            {stats.totalIncome.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Toplam Gider</h3>
          <p className="text-3xl font-bold text-red-400">
            {stats.totalExpense.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Net Kasa Durumu</h3>
          <p className={`text-3xl font-bold ${stats.netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
            {stats.netBalance.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Tarih</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Açıklama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Tutar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Tip</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Proje</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Firma</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Personel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : getFilteredTransactions().length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  İşlem kaydı bulunamadı
                </td>
              </tr>
            ) : (
              getFilteredTransactions().map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {new Date(transaction.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                      {getCategoryLabel(transaction.category)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {transaction.amount.toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === "GELIR" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
                    }`}>
                      {transaction.type === "GELIR" ? "Gelir" : "Gider"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {transaction.project?.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {transaction.company?.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {transaction.personnel?.name || "-"}
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
            <h3 className="text-xl font-semibold text-white mb-6">Yeni İşlem Ekle</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tip *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  <option value="GELIR">Gelir</option>
                  <option value="GIDER">Gider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tutar *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Tutar..."
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Açıklama *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  placeholder="Açıklama..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  <option value="MAAS">Maaş</option>
                  <option value="SGK">SGK</option>
                  <option value="HAKEDIS">Hakediş</option>
                  <option value="MALZEME">Malzeme</option>
                  <option value="DEMIR">Demir</option>
                  <option value="BETON">Beton</option>
                  <option value="NAKIYE">Nakliye</option>
                  <option value="YEMEK">Yemek</option>
                  <option value="TASERON">Taşeron</option>
                  <option value="PRIM">Prim</option>
                  <option value="AVANS">Avans</option>
                  <option value="ELDEN">Elden</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  İlgili Proje
                </label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  İlgili Firma
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
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
                  İlgili Personel
                </label>
                <select
                  name="personnelId"
                  value={formData.personnelId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Personel Seçin</option>
                  {personnel.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
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
