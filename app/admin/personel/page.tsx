"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import ConfirmModal from "@/components/ConfirmModal"

export default function AdminPersonelPage() {
  const router = useRouter()
  
  // Basit yetki kontrolü (İleride auth modülüne bağlanacak)
  const userPermissions: string[] = [] // Boş ise admin olarak kabul edilir
  const isAdmin = userPermissions.length === 0

  if (!isAdmin && !userPermissions.includes("PERSONNEL")) {
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

  const [personnel, setPersonnel] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })

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
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    
    try {
      const response = await fetch(`/api/admin/personnel/${deleteConfirm.id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        toast.success("Personel başarıyla silindi")
        fetchPersonnel()
      } else {
        toast.error("Personel silinirken hata oluştu")
      }
    } catch (error) {
      toast.error("Hata oluştu")
    }
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Personel Yönetimi</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap"
        >
          Yeni Personel Ekle
        </button>
      </div>

      {/* Inspector Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Denetçi A</h3>
              <p className="text-slate-400 text-xs">Ahmet Yılmaz</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">142</p>
              <p className="text-xs text-slate-400">Kontrol</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">34dk</p>
              <p className="text-xs text-slate-400">Ort. Süre</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">28</p>
              <p className="text-xs text-slate-400">Eksiklik</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Denetçi B</h3>
              <p className="text-slate-400 text-xs">Mehmet Kaya</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">98</p>
              <p className="text-xs text-slate-400">Kontrol</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">28dk</p>
              <p className="text-xs text-slate-400">Ort. Süre</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">15</p>
              <p className="text-xs text-slate-400">Eksiklik</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-xl p-4 border border-emerald-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Denetçi C</h3>
              <p className="text-slate-400 text-xs">Ayşe Demir</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">87</p>
              <p className="text-xs text-slate-400">Kontrol</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">31dk</p>
              <p className="text-xs text-slate-400">Ort. Süre</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">12</p>
              <p className="text-xs text-slate-400">Eksiklik</p>
            </div>
          </div>
        </div>
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
            <div className="overflow-x-auto">
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
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Personeli Sil"
        message="Bu personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />
    </div>
  )
}

function PersonelForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    personnelNo: "",
    name: "",
    tcNo: "",
    nfcUid: "",
    age: "",
    birthDate: "",
    department: "",
    currentSite: "",
    phone: "",
    email: "",
    hireDate: "",
    salary: "",
    salaryPayDay: "",
    sgkPeriod: "",
    sgkPayDay: "",
    healthStatus: "",
    bonuses: "",
    takim: "",
    gunlukYevmiye: "",
    professionId: ""
  })
  const [professions, setProfessions] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfessions()
  }, [])

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
          hireDate: formData.hireDate ? new Date(formData.hireDate) : new Date(),
          salary: formData.salary ? parseFloat(formData.salary) : 0,
          salaryPayDay: formData.salaryPayDay ? parseInt(formData.salaryPayDay) : null,
          sgkPeriod: formData.sgkPeriod || null,
          sgkPayDay: formData.sgkPayDay ? parseInt(formData.sgkPayDay) : null,
          healthStatus: formData.healthStatus || null,
          bonuses: formData.bonuses ? parseFloat(formData.bonuses) : 0,
          takim: formData.takim || null,
          gunlukYevmiye: formData.gunlukYevmiye ? parseFloat(formData.gunlukYevmiye) : 0,
          professionId: formData.professionId || null
        })
      })
      if (response.ok) {
        toast.success("Personel başarıyla eklendi")
        onSave()
      } else {
        toast.error("Personel eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Hata oluştu")
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
            <label className="block text-sm font-medium text-slate-300 mb-2">NFC Kart UID</label>
            <input
              type="text"
              value={formData.nfcUid}
              onChange={(e) => setFormData({ ...formData, nfcUid: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="NFC kart benzersiz kimliği (opsiyonel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Birim</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              required
            >
              <option value="">Birim Seçin</option>
              <option value="Yönetim">Yönetim</option>
              <option value="Saha Ekibi">Saha Ekibi</option>
              <option value="Mühendislik">Mühendislik</option>
              <option value="İSG & Kalite">İSG & Kalite</option>
              <option value="Muhasebe & Finans">Muhasebe & Finans</option>
              <option value="Taşeron">Taşeron</option>
            </select>
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Net Maaş</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prim/Avans</label>
            <input
              type="number"
              value={formData.bonuses}
              onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Birim / Meslek</label>
            <select
              value={formData.professionId}
              onChange={(e) => setFormData({ ...formData, professionId: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            >
              <option value="">Meslek Seçin</option>
              {professions.map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Takım (Eski)</label>
            <select
              value={formData.takim}
              onChange={(e) => setFormData({ ...formData, takim: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
            >
              <option value="">Takım Seçin</option>
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Günlük Yevmiye (TL)</label>
            <input
              type="number"
              value={formData.gunlukYevmiye}
              onChange={(e) => setFormData({ ...formData, gunlukYevmiye: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              step="0.01"
              placeholder="Günlük yevmiye tutarı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">SGK Dönemi</label>
            <input
              type="text"
              value={formData.sgkPeriod}
              onChange={(e) => setFormData({ ...formData, sgkPeriod: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="Ocak 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İşe Giriş Tarihi</label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Maaş Ödeme Günü</label>
            <input
              type="number"
              value={formData.salaryPayDay}
              onChange={(e) => setFormData({ ...formData, salaryPayDay: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="1-31 arası"
              min="1"
              max="31"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">SGK Ödeme Günü</label>
            <input
              type="number"
              value={formData.sgkPayDay}
              onChange={(e) => setFormData({ ...formData, sgkPayDay: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="1-31 arası"
              min="1"
              max="31"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sağlık Durumu</label>
            <input
              type="text"
              value={formData.healthStatus}
              onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              placeholder="Sağlıklı / Rapor durumu"
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
