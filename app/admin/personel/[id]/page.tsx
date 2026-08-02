import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PersonelDetailPage({
  params
}: {
  params: { id: string }
}) {
  const person = await prisma.personel.findUnique({
    where: { id: params.id }
  })

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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            person.status === "ACTIVE" 
              ? "bg-green-900/50 text-green-400" 
              : "bg-red-900/50 text-red-400"
          }`}>
            {person.status === "ACTIVE" ? "Aktif" : "Pasif"}
          </span>
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
    </div>
  )
}
