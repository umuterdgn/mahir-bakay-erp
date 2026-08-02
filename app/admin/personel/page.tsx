"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminPersonelPage() {
  const [personnel, setPersonnel] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPersonnel()
  }, [])

  const fetchPersonnel = async () => {
    try {
      const response = await fetch("/api/admin/personnel")
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data)
      }
    } catch (error) {
      console.error("Failed to fetch personnel:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return
    
    try {
      const response = await fetch(`/api/admin/personnel/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchPersonnel()
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Personel Yönetimi</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Personel Ekle
        </button>
      </div>

      {isAdding ? (
        <PersonelForm
          onSave={() => {
            fetchPersonnel()
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Yükleniyor...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Personel No</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Ad Soyad</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Yaş</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">TC No</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Birim</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Mevcut Şantiye</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {personnel.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-800">
                    <td className="px-6 py-4 text-sm text-white">{person.personnelNo}</td>
                    <td className="px-6 py-4 text-sm text-white">
                      <Link 
                        href={`/admin/personel/${person.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {person.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{person.age}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{person.tcNo || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{person.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{person.currentSite}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <Link
                        href={`/admin/personel/${person.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Detay
                      </Link>
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function PersonelForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    personnelNo: "",
    name: "",
    tcNo: "",
    age: "",
    birthDate: "",
    department: "",
    currentSite: "",
    phone: "",
    email: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          birthDate: new Date(formData.birthDate),
          hireDate: new Date()
        })
      })
      if (response.ok) {
        onSave()
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
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-xl font-semibold text-white mb-6">Yeni Personel Ekle</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Personel No</label>
            <input
              type="text"
              value={formData.personnelNo}
              onChange={(e) => setFormData({ ...formData, personnelNo: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="P001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Yaş</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Doğum Tarihi</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">TC Kimlik No</label>
            <input
              type="text"
              value={formData.tcNo}
              onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="11 haneli TC no"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Birim</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mevcut Şantiye</label>
            <input
              type="text"
              value={formData.currentSite}
              onChange={(e) => setFormData({ ...formData, currentSite: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
