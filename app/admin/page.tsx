import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardCharts from "@/components/admin/DashboardCharts"

export default async function AdminDashboard() {
  const session = await auth()

  let serviceCount = 0
  let projectCount = 0
  let staffCount = 0
  let supplierCount = 0
  let archiveCount = 0

  try {
    const counts = await Promise.all([
      prisma.service.count(),
      prisma.project.count(),
      prisma.personel.count(),
      prisma.cari.count({ where: { type: "SUPPLIER" } }),
      prisma.archive.count()
    ])
    serviceCount = counts[0]
    projectCount = counts[1]
    staffCount = counts[2]
    supplierCount = counts[3]
    archiveCount = counts[4]
  } catch (error) {
    console.error("Error fetching dashboard counts:", error)
    // Keep counts as 0 if database fails
  }

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        Hoş Geldiniz, {session?.user?.name}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-3xl font-bold text-blue-400 mb-2">{serviceCount}</div>
          <div className="text-slate-300">Hizmet</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-3xl font-bold text-green-400 mb-2">{projectCount}</div>
          <div className="text-slate-300">Proje</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-3xl font-bold text-purple-400 mb-2">{staffCount}</div>
          <div className="text-slate-300">Personel</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-3xl font-bold text-orange-400 mb-2">{supplierCount}</div>
          <div className="text-slate-300">Tedarikçi</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-3xl font-bold text-red-400 mb-2">{archiveCount}</div>
          <div className="text-slate-300">Arşiv</div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/admin/cms"
            className="block p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium text-white">Yeni İçerik Ekle</div>
            <div className="text-sm text-slate-400">Hizmet veya proje ekleyin</div>
          </a>
          <a
            href="/admin/personel"
            className="block p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium text-white">Personel Yönetimi</div>
            <div className="text-sm text-slate-400">Personel ekleyin veya düzenleyin</div>
          </a>
          <a
            href="/admin/archive"
            className="block p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium text-white">Arşiv Yükle</div>
            <div className="text-sm text-slate-400">PDF dosyaları yükleyin</div>
          </a>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts />
    </div>
  )
}