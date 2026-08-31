"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { Users, MapPin, Briefcase, Phone, Mail, CheckCircle, AlertCircle, Clock, Wallet, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PersonnelPage() {
  const personnelData = [
    { id: "P001", name: "Ahmet Yılmaz", department: "İnşaat", position: "Kalıpçı", phone: "0555 123 4567", email: "ahmet@nexa.com", status: "Active", location: "İskenderun TOKİ", salaryStatus: "Paid" },
    { id: "P002", name: "Mehmet Demir", department: "Elektrik", position: "Elektrikçi", phone: "0555 234 5678", email: "mehmet@nexa.com", status: "Active", location: "Arsuz Konutları", salaryStatus: "Pending" },
    { id: "P003", name: "Ali Kaya", department: "İnşaat", position: "Demirci", phone: "0555 345 6789", email: "ali@nexa.com", status: "On Leave", location: "Dörtyol Sitesi", salaryStatus: "Paid" },
    { id: "P004", name: "Hasan Öztürk", department: "Mekanik", position: "Tesisatçı", phone: "0555 456 7890", email: "hasan@nexa.com", status: "Active", location: "Erzin Proje", salaryStatus: "Pending" },
    { id: "P005", name: "İbrahim Şahin", department: "İnşaat", position: "Mimar", phone: "0555 567 8901", email: "ibrahim@nexa.com", status: "Active", location: "İskenderun TOKİ", salaryStatus: "Paid" },
  ]

  return (
    <div className="lg:mt-0 mt-16">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          Personel Listesi
        </h1>
        <p className="text-slate-400 mt-1">Personel yönetimi ve takibi</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              <th className="text-left p-4 text-slate-300 font-medium">Personel No</th>
              <th className="text-left p-4 text-slate-300 font-medium">Ad Soyad</th>
              <th className="text-left p-4 text-slate-300 font-medium">Departman</th>
              <th className="text-left p-4 text-slate-300 font-medium">Pozisyon</th>
              <th className="text-left p-4 text-slate-300 font-medium">Telefon</th>
              <th className="text-left p-4 text-slate-300 font-medium">E-posta</th>
              <th className="text-left p-4 text-slate-300 font-medium">Konum</th>
              <th className="text-left p-4 text-slate-300 font-medium">Durum</th>
              <th className="text-left p-4 text-slate-300 font-medium">Maaş Durumu</th>
              <th className="text-left p-4 text-slate-300 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {personnelData.map((person) => (
              <tr key={person.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-white font-medium">{person.id}</td>
                <td className="p-4 text-white">{person.name}</td>
                <td className="p-4 text-slate-300">{person.department}</td>
                <td className="p-4 text-slate-300">{person.position}</td>
                <td className="p-4 text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {person.phone}
                </td>
                <td className="p-4 text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {person.email}
                </td>
                <td className="p-4 text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {person.location}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    person.status === "Active" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {person.status === "Active" && <CheckCircle className="w-3 h-3" />}
                    {person.status === "On Leave" && <Clock className="w-3 h-3" />}
                    {person.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    person.salaryStatus === "Paid" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {person.salaryStatus === "Paid" && <CheckCircle className="w-3 h-3" />}
                    {person.salaryStatus === "Pending" && <Clock className="w-3 h-3" />}
                    {person.salaryStatus === "Paid" ? "Ödendi" : "Ödeme Bekliyor"}
                  </span>
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/personnel/${person.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    Ödeme / Detay
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
