"use client"

import { useState, useEffect } from "react"

export default function AdminStockPage() {
  const [stocks, setStocks] = useState<any[]>([])
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isTransaction, setIsTransaction] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/admin/stock")
      if (response.ok) {
        const data = await response.json()
        setStocks(data)
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStock = (stock: any) => {
    const inTotal = stock.transactions
      ?.filter((t: any) => t.type === "IN")
      .reduce((sum: number, t: any) => sum + t.quantity, 0) || 0
    const outTotal = stock.transactions
      ?.filter((t: any) => t.type === "OUT")
      .reduce((sum: number, t: any) => sum + t.quantity, 0) || 0
    return inTotal - outTotal
  }

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        Stok Yönetimi
      </h1>

      {/* Add Stock Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Stok Kalemi Ekle
        </button>
      </div>

      {/* Stock List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Stok Adı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Birim</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Mevcut Miktar</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Stok kaydı bulunamadı
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-6 py-4 text-sm font-medium text-white">{stock.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{stock.unit}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {calculateStock(stock)} {stock.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStock(stock)
                        setIsTransaction(true)
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      İşlem
                    </button>
                    <button
                      onClick={() => setSelectedStock(stock)}
                      className="text-green-400 hover:text-green-300"
                    >
                      Geçmiş
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {isAdding && (
        <AddStockModal
          onClose={() => setIsAdding(false)}
          onSave={(newStock) => {
            fetchStocks()
            setIsAdding(false)
          }}
        />
      )}

      {/* Transaction Modal */}
      {isTransaction && selectedStock && (
        <TransactionModal
          stock={selectedStock}
          onClose={() => {
            setIsTransaction(false)
            setSelectedStock(null)
          }}
          onSave={() => {
            fetchStocks()
            setIsTransaction(false)
            setSelectedStock(null)
          }}
        />
      )}

      {/* Stock History Modal */}
      {selectedStock && !isTransaction && (
        <StockHistoryModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  )
}

function AddStockModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: "",
    unit: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        const newStock = await response.json()
        onSave(newStock)
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6">Yeni Stok Kalemi</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stok Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Birim *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            >
              <option value="">Birim Seçin</option>
              <option value="adet">Adet</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="ton">Ton</option>
              <option value="m">Metre (m)</option>
              <option value="m2">Metrekare (m²)</option>
              <option value="m3">Metreküp (m³)</option>
              <option value="lt">Litre (lt)</option>
              <option value="paket">Paket</option>
            </select>
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

function TransactionModal({ stock, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    type: "IN" as "IN" | "OUT",
    quantity: "",
    note: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/stock/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: stock.id,
          ...formData,
          quantity: parseFloat(formData.quantity)
        })
      })
      if (response.ok) {
        onSave()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2">Stok İşlemi</h2>
        <p className="text-slate-400 mb-6">{stock.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İşlem Türü</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "IN" })}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  formData.type === "IN"
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                Giriş (+)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "OUT" })}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  formData.type === "OUT"
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                Çıkış (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Miktar *</label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Not</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
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

function StockHistoryModal({ stock, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{stock.name} - Geçmiş</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {stock.transactions?.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tür</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Miktar</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Tarih</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stock.transactions.map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "IN"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-red-900/50 text-red-400"
                      }`}>
                        {transaction.type === "IN" ? "Giriş" : "Çıkış"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {transaction.quantity} {stock.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(transaction.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{transaction.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-center py-8">İşlem geçmişi bulunamadı</p>
          )}
        </div>
      </div>
    </div>
  )
}