import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import WorkerFinancialDashboard from "@/components/WorkerFinancialDashboard"

export default async function WorkerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: resolvedParams.id },
      include: {
        project: true,
        records: {
          orderBy: { date: 'desc' },
          take: 30 // Son 30 gün
        },
        payments: {
          orderBy: { date: 'desc' },
          take: 50
        }
      }
    }) as any

    if (!worker) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  href="/admin/workers" 
                  className="text-slate-400 hover:text-white text-sm mb-2 inline-block"
                >
                  ← İşçilere Dön
                </Link>
                <h1 className="text-3xl font-bold text-white">
                  {worker.firstName} {worker.lastName}
                </h1>
                <p className="text-slate-400 mt-1">
                  {worker.team} • {worker.project?.name || "Proje Yok"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Kullanıcı Adı</p>
                <p className="text-white font-medium">@{worker.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <WorkerFinancialDashboard worker={worker} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching worker details:", error)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hata Oluştu</h1>
          <p className="text-slate-400 mb-4">Personel bilgileri yüklenirken bir hata oluştu.</p>
          <Link 
            href="/admin/workers"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            İşçilere Dön
          </Link>
        </div>
      </div>
    )
  }
}
