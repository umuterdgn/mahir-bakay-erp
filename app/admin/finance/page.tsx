"use client"

import { useState, useEffect } from "react"

export default function AdminFinancePage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [financeRecords, setFinanceRecords] = useState<any[]>([])
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)

  useEffect(() => {
    fetchSuppliers()
    fetchFinanceRecords()
  }, [searchTerm])

  const fetchSuppliers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      
      const response = await fetch(`/api/admin/suppliers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFinanceRecords = async () => {
    try {
      const response = await fetch("/api/admin/finance")
      if (response.ok) {
        const data = await response.json()
        setFinanceRecords(data)
      }
    } catch (error) {
      console.error("Failed to fetch finance records:", error)
    }
  }

  const totalIncome = financeRecords
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = financeRecords
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0)
  const netBalance = totalIncome - totalExpense

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-3xl font-bold text-white mb-8">
        Finans Yönetimi
      </h1>

      {/* Search and Add */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
          placeholder="Tedarikçi ara..."
        />
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Tedarikçi Ekle
        </button>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Toplam Gelir</div>
          <div className="text-3xl font-bold text-green-400">₺{totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Toplam Gider</div>
          <div className="text-3xl font-bold text-red-400">₺{totalExpense.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Net Kasa</div>
          <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            ₺{netBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Gelir/Gider Ekle</h2>
          <button
            onClick={() => setIsAddingTransaction(!isAddingTransaction)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            {isAddingTransaction ? "Kapat" : "+ Ekle"}
          </button>
        </div>

        {isAddingTransaction && (
          <TransactionForm
            onSave={() => {
              fetchFinanceRecords()
              setIsAddingTransaction(false)
            }}
            onCancel={() => setIsAddingTransaction(false)}
          />
        )}
      </div>

      {/* Suppliers List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Tedarikçi Adı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">İletişim</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">E-posta</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Telefon</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Tedarikçi bulunamadı
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr 
                  key={supplier.id}
                  className="hover:bg-slate-800 cursor-pointer"
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-white">{supplier.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{supplier.contact || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{supplier.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{supplier.phone || "-"}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSupplier(supplier)
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Detaylar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {/* Add Supplier Modal */}
      {isAdding && (
        <AddSupplierModal
          onClose={() => setIsAdding(false)}
          onSave={(newSupplier) => {
            fetchSuppliers()
            setIsAdding(false)
          }}
        />
      )}
    </div>
  )
}

function SupplierDetailModal({ supplier, onClose }: any) {
  const [activeTab, setActiveTab] = useState<"debts" | "payments">("debts")
  const [isAddingDebt, setIsAddingDebt] = useState(false)
  const [isAddingPayment, setIsAddingPayment] = useState(false)

  const totalDebt = supplier.debts?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0
  const totalPaid = supplier.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const remainingBalance = totalDebt - totalPaid

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-800">
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-900/30">
            <div className="text-sm text-red-400 mb-1">Toplam Borç</div>
            <div className="text-2xl font-bold text-red-300">₺{totalDebt.toLocaleString()}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-900/30">
            <div className="text-sm text-green-400 mb-1">Ödenen Tutar</div>
            <div className="text-2xl font-bold text-green-300">₺{totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-900/30">
            <div className="text-sm text-blue-400 mb-1">Kalan Bakiye</div>
            <div className="text-2xl font-bold text-blue-300">₺{remainingBalance.toLocaleString()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex space-x-4 border-b border-slate-800">
          <button
            onClick={() => setIsAddingDebt(true)}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
          >
            + Borç Ekle
          </button>
          <button
            onClick={() => setIsAddingPayment(true)}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
          >
            - Ödeme Yap
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab("debts")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "debts"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Borçlar
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "payments"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Ödemeler
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[400px]">
          {activeTab === "debts" && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Borç Geçmişi</h3>
              {supplier.debts?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tutar</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Açıklama</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {supplier.debts.map((debt: any) => (
                      <tr key={debt.id}>
                        <td className="px-4 py-3 text-sm text-red-400 font-medium">
                          ₺{debt.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{debt.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(debt.date).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 text-center py-8">Borç kaydı bulunamadı</p>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Ödeme Geçmişi</h3>
              {supplier.payments?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tutar</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Açıklama</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {supplier.payments.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm text-green-400 font-medium">
                          ₺{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{payment.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(payment.date).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 text-center py-8">Ödeme kaydı bulunamadı</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Debt Modal */}
      {isAddingDebt && (
        <AddDebtModal
          supplierId={supplier.id}
          onClose={() => setIsAddingDebt(false)}
          onSuccess={() => {
            setIsAddingDebt(false)
            window.location.reload()
          }}
        />
      )}

      {/* Add Payment Modal */}
      {isAddingPayment && (
        <AddPaymentModal
          supplierId={supplier.id}
          onClose={() => setIsAddingPayment(false)}
          onSuccess={() => {
            setIsAddingPayment(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function AddDebtModal({ supplierId, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    amount: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/suppliers/debt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      })
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6">Borç Ekle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tutar *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddPaymentModal({ supplierId, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    amount: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/suppliers/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      })
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6">Ödeme Yap</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tutar *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
            >
              Öde
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddSupplierModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        const newSupplier = await response.json()
        onSave(newSupplier)
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6">Yeni Tedarikçi</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tedarikçi Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İletişim Kişisi</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TransactionForm({ onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    category: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        onSave()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tür</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="INCOME">Gelir</option>
            <option value="EXPENSE">Gider</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tutar *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Kategori</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          placeholder="Örn: Satış, Gider, Maaş..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          placeholder="Açıklama..."
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
  )
}