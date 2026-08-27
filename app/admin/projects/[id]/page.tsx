/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import ProjectDetailClient from "@/components/ProjectDetailClient"
import ProjectDetailTabs from "@/components/ProjectDetailTabs"

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      company: true,
      archives: true,
      transactions: true,
      siteZones: true
    }
  }) as any

  if (!project) {
    notFound()
  }

  // Calculate project financial stats
  const totalIncome = project.transactions
    .filter((t: any) => t.type === "GELIR")
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  
  const totalExpense = project.transactions
    .filter((t: any) => t.type === "GIDER")
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  
  const netBalance = totalIncome - totalExpense

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ETUT": return "Etüt"
      case "CIZIM": return "Çizim"
      case "SAHA": return "Saha"
      case "TAMAMLANDI": return "Tamamlandı"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ETUT": return "bg-purple-900/50 text-purple-400"
      case "CIZIM": return "bg-blue-900/50 text-blue-400"
      case "SAHA": return "bg-orange-900/50 text-orange-400"
      case "TAMAMLANDI": return "bg-green-900/50 text-green-400"
      default: return "bg-slate-900/50 text-slate-400"
    }
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          ← Projeler Listesine Dön
        </Link>
      </div>

      {/* Header */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {project.name || project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              {project.company && (
                <span className="flex items-center">
                  <span className="mr-2">Müşteri:</span>
                  <span className="text-white font-medium">{project.company.name}</span>
                </span>
              )}
              <span className="flex items-center">
                <span className="mr-2">Başlangıç:</span>
                <span className="text-white">
                  {new Date(project.startDate).toLocaleDateString("tr-TR")}
                </span>
              </span>
              {project.endDate && (
                <span className="flex items-center">
                  <span className="mr-2">Bitiş:</span>
                  <span className="text-white">
                    {new Date(project.endDate).toLocaleDateString("tr-TR")}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProjectDetailClient project={project} />
            {project.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Financial Summary (Narrow) */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Finansal Özet</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-1">Toplam Gelir</label>
                <p className="text-2xl font-bold text-green-400">
                  {totalIncome.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-1">Toplam Gider</label>
                <p className="text-2xl font-bold text-red-400">
                  {totalExpense.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-1">Net Durum</label>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {netBalance.toLocaleString("tr-TR")} ₺
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-md font-semibold text-white mb-3">Son İşlemler</h4>
              {project.transactions.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Henüz işlem yok
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {project.transactions.slice(0, 10).map((transaction: any) => (
                    <div key={transaction.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                      <p className="text-white text-sm font-medium truncate">{transaction.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-slate-500 text-xs">
                          {new Date(transaction.date).toLocaleDateString("tr-TR")}
                        </p>
                        <p className={`font-semibold text-sm ${transaction.type === "GELIR" ? "text-green-400" : "text-red-400"}`}>
                          {transaction.type === "GELIR" ? "+" : "-"}
                          {transaction.amount.toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabbed Content (Wide, col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectDetailTabs project={project} />
        </div>
      </div>
    </div>
  )
}
