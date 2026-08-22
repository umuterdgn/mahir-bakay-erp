"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Nfc } from "lucide-react"
import { createPersonnelNfcPayload } from "@/lib/nfc-crypto"

export default function PersonelDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [person, setPerson] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [assignedInventory, setAssignedInventory] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculatedValues, setCalculatedValues] = useState({
    toplamKazanilan: 0,
    kesintilerToplami: 0,
    netOdenecek: 0,
    tamGunSayisi: 0,
    yarimGunSayisi: 0,
    totalDayMultiplier: 0,
    grossEntitlement: 0,
    toplamPrim: 0
  })
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false)
  const [isNfcWriting, setIsNfcWriting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({
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
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    type: "ELDEN",
    description: ""
  })
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    role: "STAFF"
  })
  const router = useRouter()

  useEffect(() => {
    const resolveParams = async () => {
      const p = await params
      setResolvedParams(p)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchPerson()
      fetchPayments()
      fetchAssignedInventory()
    }
  }, [resolvedParams])

  // Calculate financial values when person or payments change
  useEffect(() => {
    if (person && payments) {
      // Use dailyWage (Günlük Yevmiye) from Personel model
      const dailyWage = person.gunlukYevmiye || 0
      const bonuses = person.bonuses || 0

      // Calculate attendance from attendanceRecords
      const totalDayMultiplier = attendanceRecords.reduce((sum: number, record: any) => {
        return sum + (record.dayMultiplier || 0)
      }, 0)

      const tamGunSayisi = attendanceRecords.filter((record: any) => record.dayMultiplier === 1).length
      const yarimGunSayisi = attendanceRecords.filter((record: any) => record.dayMultiplier === 0.5).length

      // Calculate gross entitlement (Hakediş)
      const grossEntitlement = totalDayMultiplier * dailyWage

      // Calculate total bonus from payments
      const toplamPrim = payments.reduce((sum: number, p: any) => {
        if (p.type === 'PRIM') {
          return sum + p.amount
        }
        return sum
      }, 0)

      // Calculate total deductions (MAAS, AVANS, ELDEN)
      const kesintilerToplami = payments.reduce((sum: number, p: any) => {
        if (p.type === 'MAAS' || p.type === 'AVANS' || p.type === 'ELDEN') {
          return sum + p.amount
        }
        return sum
      }, 0)

      // Calculate net payable
      const toplamKazanilan = grossEntitlement + toplamPrim
      const netOdenecek = toplamKazanilan - kesintilerToplami

      setCalculatedValues({
        toplamKazanilan,
        kesintilerToplami,
        netOdenecek,
        tamGunSayisi,
        yarimGunSayisi,
        totalDayMultiplier,
        grossEntitlement,
        toplamPrim
      })
    }
  }, [person, payments, attendanceRecords])

  const fetchPerson = async () => {
    try {
      const response = await fetch(`/api/admin/personnel/${resolvedParams?.id}`)
      if (response.ok) {
        const data = await response.json()
        setPerson(data)
        if (data.payments) {
          setPayments(data.payments)
        }
        if (data.assignedItems) {
          setAssignedInventory(data.assignedItems)
        }
        if (data.attendanceRecords) {
          setAttendanceRecords(data.attendanceRecords)
        }
      } else {
        notFound()
      }
    } catch (error) {
      console.error("Failed to fetch person:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/personnel/${resolvedParams?.id}/payments`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    }
  }

  const fetchAssignedInventory = async () => {
    try {
      const response = await fetch(`/api/admin/personnel/${resolvedParams?.id}/inventory`)
      if (response.ok) {
        const data = await response.json()
        setAssignedInventory(data)
      }
    } catch (error) {
      console.error("Failed to fetch assigned inventory:", error)
    }
  }

  const handlePayment = async (type: "MAAS" | "SGK" | "PRIM") => {
    if (!person) return

    try {
      // Önce PersonelPayment tablosuna kaydet
      const paymentResponse = await fetch("/api/admin/personnel-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personelId: person.id,
          type: type,
          amount: type === "MAAS" ? person.salary : type === "PRIM" ? person.bonuses : 0,
          description: type === "MAAS" ? "Maaş Ödemesi" : type === "SGK" ? "SGK Ödemesi" : "Prim Ödemesi",
          isPaid: true,
          paidDate: new Date()
        })
      })

      if (paymentResponse.ok) {
        toast.success("Ödeme başarıyla işlendi")
        fetchPayments()
      } else {
        toast.error("Ödeme işlenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Ödeme işlenirken hata oluştu")
    }
  }

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!person || !paymentForm.amount) {
      toast.error("Tutar girin")
      return
    }

    try {
      const response = await fetch("/api/admin/personnel-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personelId: person.id,
          type: paymentForm.type,
          amount: parseFloat(paymentForm.amount),
          description: paymentForm.description || (paymentForm.type === "ELDEN" ? "Elden Nakit Ödemesi" : "Manuel Prim Ödemesi"),
          isPaid: true,
          paidDate: new Date()
        })
      })

      if (response.ok) {
        toast.success("Ödeme başarıyla işlendi")
        setIsPaymentModalOpen(false)
        setPaymentForm({ amount: "", type: "ELDEN", description: "" })
        fetchPayments()
      } else {
        toast.error("Ödeme işlenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Ödeme işlenirken hata oluştu")
    }
  }

  const openEditModal = () => {
    if (!person) return
    setEditFormData({
      personnelNo: person.personnelNo || "",
      name: person.name,
      tcNo: person.tcNo || "",
      nfcUid: person.nfcUid || "",
      age: person.age?.toString() || "",
      birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : "",
      department: person.department || "",
      currentSite: person.currentSite || "",
      phone: person.phone || "",
      email: person.email || "",
      hireDate: person.hireDate ? new Date(person.hireDate).toISOString().split('T')[0] : "",
      salary: person.salary?.toString() || "0",
      salaryPayDay: person.salaryPayDay?.toString() || "",
      sgkPeriod: person.sgkPeriod || "",
      sgkPayDay: person.sgkPayDay?.toString() || "",
      healthStatus: person.healthStatus || "",
      bonuses: person.bonuses?.toString() || "0",
      takim: person.takim || "",
      gunlukYevmiye: person.gunlukYevmiye?.toString() || "0",
      professionId: person.professionId || ""
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditFormData({
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
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!person) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/personnel/${person.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editFormData,
          age: parseInt(editFormData.age),
          birthDate: editFormData.birthDate ? new Date(editFormData.birthDate) : null,
          hireDate: editFormData.hireDate ? new Date(editFormData.hireDate) : null,
          salary: parseFloat(editFormData.salary),
          salaryPayDay: editFormData.salaryPayDay ? parseInt(editFormData.salaryPayDay) : null,
          sgkPeriod: editFormData.sgkPeriod || null,
          sgkPayDay: editFormData.sgkPayDay ? parseInt(editFormData.sgkPayDay) : null,
          healthStatus: editFormData.healthStatus || null,
          bonuses: parseFloat(editFormData.bonuses),
          gunlukYevmiye: parseFloat(editFormData.gunlukYevmiye),
          professionId: editFormData.professionId || null
        })
      })

      if (response.ok) {
        toast.success("Personel güncellendi")
        closeEditModal()
        router.refresh()
      } else {
        toast.error("Personel güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Personel güncellenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!person || !loginForm.username || !loginForm.password) {
      toast.error("Kullanıcı adı ve şifre gereklidir")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/personnel/${person.id}/grant-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...loginForm,
          email: `${loginForm.username}@mahir-bakay.local` // Generate dummy email for User model
        })
      })

      if (response.ok) {
        toast.success("Sisteme giriş izni verildi")
        setIsLoginModalOpen(false)
        setLoginForm({ username: "", password: "", role: "STAFF" })
        fetchPerson()
      } else {
        const error = await response.json()
        toast.error(error.error || "Giriş izni verilirken hata oluştu")
      }
    } catch (error) {
      toast.error("Giriş izni verilirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNfcWrite = async () => {
    if (!person || !('NDEFReader' in window)) {
      toast.error("Bu tarayıcı Web NFC'yi desteklemiyor. Lütfen Android Chrome kullanın.")
      return
    }

    setIsNfcWriting(true)
    try {
      const ndef = new (window as any).NDEFReader()
      const encryptedData = createPersonnelNfcPayload(person.id)
      
      await ndef.write({
        records: [{
          recordType: "mime",
          mediaType: "application/vnd.mahirbakay.erp",
          data: new TextEncoder().encode(encryptedData)
        }]
      })
      
      toast.success("NFC Kart başarıyla programlandı ve şifrelendi!")
      setIsNfcModalOpen(false)
    } catch (error) {
      console.error("NFC write error:", error)
      toast.error("NFC kart yazma hatası oluştu")
    } finally {
      setIsNfcWriting(false)
    }
  }

  if (loading) {
    return (
      <div className="lg:mt-0 mt-16">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  if (!person) {
    notFound()
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="mb-6">
        <Link
          href="/admin/personel"
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          ← Personel Listesine Dön
        </Link>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {person.name}
            </h1>
            <p className="text-slate-400">Personel No: {person.personnelNo}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Düzenle
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2"
            >
              🔑 {person.userId ? "Giriş Bilgilerini Güncelle" : "Sisteme Giriş İzni Ver"}
            </button>
            <button
              onClick={() => setIsNfcModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors flex items-center gap-2"
            >
              <Nfc className="w-4 h-4" />
              NFC Karta Programla
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              person.status === "ACTIVE" 
                ? "bg-green-900/50 text-green-400" 
                : "bg-red-900/50 text-red-400"
            }`}>
              {person.status === "ACTIVE" ? "Aktif" : "Pasif"}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Kişisel Bilgiler</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Yaş</label>
                <p className="text-white">{person.age}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">TC Kimlik No</label>
                <p className="text-white">{person.tcNo || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Doğum Tarihi</label>
                <p className="text-white">
                  {new Date(person.birthDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cinsiyet</label>
                <p className="text-white">{person.gender || "-"}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Telefon</label>
              <p className="text-white">{person.phone || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">E-posta</label>
              <p className="text-white">{person.email || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Adres</label>
              <p className="text-white">{person.address || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Sağlık Durumu</label>
              <p className="text-white">{person.healthStatus || "-"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">İş Bilgileri</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Birim</label>
              <p className="text-white">{person.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Görev/Ünvan</label>
              <p className="text-white">{person.position || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Mevcut Şantiye</label>
              <p className="text-white">{person.currentSite}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">İşe Giriş Tarihi</label>
              <p className="text-white">
                {new Date(person.hireDate).toLocaleDateString("tr-TR")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">İşten Çıkış Tarihi</label>
              <p className="text-white">
                {person.leavingDate 
                  ? new Date(person.leavingDate).toLocaleDateString("tr-TR")
                  : "-"
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">İş Türü</label>
              <p className="text-white">{person.employmentType || "-"}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 mb-4">Finans ve Özlük Bilgileri</h3>
          
          {/* Hakediş Hesaplama */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4">
            <h4 className="text-md font-semibold text-white mb-3">Hakediş Hesabı</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Tam Gün Sayısı</label>
                <p className="text-white font-medium">
                  {calculatedValues.tamGunSayisi}
                </p>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Yarım Gün Sayısı</label>
                <p className="text-white font-medium">
                  {calculatedValues.yarimGunSayisi}
                </p>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Günlük Yevmiye</label>
                <p className="text-white font-medium">
                  {person.gunlukYevmiye?.toLocaleString("tr-TR") || 0} ₺
                </p>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Toplam Gün Çarpanı</label>
                <p className="text-white font-medium">
                  {calculatedValues.totalDayMultiplier.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Güncel Bakiye Kartı */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-xl p-6 border border-blue-700 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">GÜNCEL BAKİYE (ÖDENECEK)</h4>
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-400 mb-2">
                ₺{calculatedValues.netOdenecek.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-slate-400 text-sm">
                Toplam Kazanılan - Kesintiler
              </p>
            </div>
          </div>

          {/* Hesaplama Detayları */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Brüt Hakediş</label>
              <p className="text-2xl font-bold text-green-400">
                ₺{calculatedValues.grossEntitlement.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Gün Çarpanı × Yevmiye</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Toplam Prim</label>
              <p className="text-2xl font-bold text-purple-400">
                ₺{calculatedValues.toplamPrim.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Prim Ödemeleri</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Kesintiler Toplamı</label>
              <p className="text-2xl font-bold text-red-400">
                ₺{calculatedValues.kesintilerToplami.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Maaş + Avans + Elden</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Toplam Kazanılan</label>
              <p className="text-2xl font-bold text-green-400">
                ₺{calculatedValues.toplamKazanilan.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Brüt + Prim</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Kesintiler Toplamı</label>
              <p className="text-2xl font-bold text-red-400">
                ₺{calculatedValues.kesintilerToplami.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Maaş + Avans + Elden</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Net Ödenecek</label>
              <p className="text-2xl font-bold text-blue-400">
                ₺{calculatedValues.netOdenecek.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Kalan Bakiye</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Hakediş Formülü</label>
              <p className="text-xs text-slate-300 mt-1">
                (Gün Çarpanı × Yevmiye + Prim) - Kesintiler
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Maaş</label>
              <p className="text-2xl font-bold text-white mb-2">
                {person.salary.toLocaleString("tr-TR")} ₺
              </p>
              {person.salaryPayDay && (
                <p className="text-xs text-slate-500 mb-2">Ödeme Günü: {person.salaryPayDay}</p>
              )}
              {(() => {
                const today = new Date().getDate()
                const payDay = person.salaryPayDay
                if (payDay && today > payDay) {
                  return <span className="inline-block px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded-full mb-2">Ödeme Gecikti</span>
                } else if (payDay && today >= payDay - 3) {
                  return <span className="inline-block px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded-full mb-2">Ödeme Yaklaştı</span>
                }
                return null
              })()}
              <button
                onClick={() => handlePayment("MAAS")}
                className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
              >
                Maaş Öde
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">SGK Durumu / Dönemi</label>
              <p className="text-2xl font-bold text-white mb-2">
                {person.sgkPeriod || "Belirtilmedi"}
              </p>
              {person.sgkPayDay && (
                <p className="text-xs text-slate-500 mb-2">Ödeme Günü: {person.sgkPayDay}</p>
              )}
              {(() => {
                const today = new Date().getDate()
                const payDay = person.sgkPayDay
                if (payDay && today > payDay) {
                  return <span className="inline-block px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded-full mb-2">Ödeme Gecikti</span>
                } else if (payDay && today >= payDay - 3) {
                  return <span className="inline-block px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded-full mb-2">Ödeme Yaklaştı</span>
                }
                return null
              })()}
              <button
                onClick={() => handlePayment("SGK")}
                className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm"
              >
                SGK Öde
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-1">Primler / Avans</label>
              <p className="text-2xl font-bold text-white mb-2">
                {person.bonuses.toLocaleString("tr-TR")} ₺
              </p>
              <button
                onClick={() => handlePayment("PRIM")}
                className="w-full px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm mb-2"
              >
                Prim Öde
              </button>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors text-sm"
              >
                Manuel Ödeme
              </button>
            </div>
          </div>
        </div>

        {/* Finansal İşlem Geçmişi */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 mb-4">Finansal İşlem Geçmişi</h3>
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz finansal işlem yok
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Tarih</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">İşlem Tipi</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Açıklama</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(payment.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.type === "MAAS" ? "bg-blue-900/50 text-blue-400" :
                          payment.type === "SGK" ? "bg-purple-900/50 text-purple-400" :
                          payment.type === "PRIM" ? "bg-green-900/50 text-green-400" :
                          payment.type === "AVANS" ? "bg-red-900/50 text-red-400" :
                          "bg-amber-900/50 text-amber-400"
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {payment.description || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span className={
                          payment.type === "PRIM" ? "text-green-400" : "text-white"
                        }>
                          {payment.amount.toLocaleString("tr-TR")} ₺
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Yoklama Kayıtları */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 mb-4">Yoklama Kayıtları</h3>
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {!attendanceRecords || attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz yoklama kaydı yok
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Tarih</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Proje</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Giriş</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Çıkış</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Gün Çarpanı</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords?.map((record: any) => (
                    <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(record.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {record.project?.name || record.project?.title || "-"}
                      </td>
                      <td className="py-3 px-4 text-green-400">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString("tr-TR") : "-"}
                      </td>
                      <td className="py-3 px-4 text-red-400">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString("tr-TR") : "-"}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {record.dayMultiplier || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Zimmetli Ekipmanlar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 mb-4">Zimmetli Ekipmanlar</h3>
          
          {assignedInventory.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
              Zimmetli ekipman bulunmuyor
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Malzeme Adı</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Miktar</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Birim</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Proje</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Zimmet Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedInventory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-white">{item.name}</td>
                      <td className="py-3 px-4 text-white">{item.quantity}</td>
                      <td className="py-3 px-4 text-white">{item.unit}</td>
                      <td className="py-3 px-4 text-white">{item.project?.name || "-"}</td>
                      <td className="py-3 px-4 text-white text-sm">
                        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex space-x-4">
            <Link
              href="/admin/personel"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Kapat
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Personel Düzenle</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Personel No</label>
                  <input
                    type="text"
                    name="personnelNo"
                    value={editFormData.personnelNo}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, personnelNo: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">TC No</label>
                  <input
                    type="text"
                    name="tcNo"
                    value={editFormData.tcNo}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tcNo: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">NFC Kart UID</label>
                  <input
                    type="text"
                    name="nfcUid"
                    value={editFormData.nfcUid}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, nfcUid: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="NFC kart benzersiz kimliği (opsiyonel)"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={editFormData.birthDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Yaş</label>
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">İşe Giriş Tarihi</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={editFormData.hireDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Birim</label>
                  <input
                    type="text"
                    name="department"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mevcut Şantiye</label>
                  <input
                    type="text"
                    name="currentSite"
                    value={editFormData.currentSite}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, currentSite: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Net Maaş</label>
                  <input
                    type="number"
                    name="salary"
                    value={editFormData.salary}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Maaş Ödeme Günü</label>
                  <input
                    type="number"
                    name="salaryPayDay"
                    value={editFormData.salaryPayDay}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, salaryPayDay: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SGK Dönemi</label>
                  <input
                    type="text"
                    name="sgkPeriod"
                    value={editFormData.sgkPeriod}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, sgkPeriod: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SGK Ödeme Günü</label>
                  <input
                    type="number"
                    name="sgkPayDay"
                    value={editFormData.sgkPayDay}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, sgkPayDay: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primler / Avans</label>
                  <input
                    type="number"
                    name="bonuses"
                    value={editFormData.bonuses}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bonuses: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Günlük Yevmiye</label>
                  <input
                    type="number"
                    name="gunlukYevmiye"
                    value={editFormData.gunlukYevmiye}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, gunlukYevmiye: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Takım</label>
                  <input
                    type="text"
                    name="takim"
                    value={editFormData.takim}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, takim: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sağlık Durumu</label>
                  <input
                    type="text"
                    name="healthStatus"
                    value={editFormData.healthStatus}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, healthStatus: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
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

      {/* Manual Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Manuel Ödeme</h3>
            
            <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ödeme Türü</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="ELDEN">Elden Nakit</option>
                  <option value="PRIM">Prim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tutar (₺)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  step="0.01"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Ödeme açıklaması"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
                >
                  Öde
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Grant Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              🔑 Sisteme Giriş İzni Ver
            </h3>
            
            <form onSubmit={handleLoginGrantSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                  placeholder="ornek: ahmet.yilmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                <select
                  value={loginForm.role}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="STAFF">Personel</option>
                  <option value="SITE_MANAGER">Şantiye Şefi</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "İşleniyor..." : "İzin Ver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NFC Programming Modal */}
      {isNfcModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Nfc className="w-5 h-5" />
              NFC Karta Programla (Şifreli)
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300 text-sm mb-2">
                  <strong>Personel:</strong> {person?.name}
                </p>
                <p className="text-slate-400 text-xs">
                  Personel ID şifrelenecek şekilde NFC kartına yazılacak.
                </p>
              </div>

              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700">
                <p className="text-purple-300 text-sm">
                  ⚠️ Lütfen personelin NFC kartını telefonun arkasına dokundurun...
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNfcModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isNfcWriting}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleNfcWrite}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors"
                  disabled={isNfcWriting}
                >
                  {isNfcWriting ? "Yazılıyor..." : "Karta Yaz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
