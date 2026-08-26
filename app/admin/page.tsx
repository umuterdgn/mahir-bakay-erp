/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import FinancialChart from "../../components/admin/FinancialChart"
import WeatherWidget from "@/components/ui/WeatherWidget"

export default async function AdminDashboard() {
  const session = await auth()

  // Fetch dashboard statistics
  const [
    totalProjects,
    totalPersonnel,
    todayCheckins,
    upcomingReminders,
    recentLogs,
    totalRevenue,
    totalExpenses,
    lowStockCount
  ] = await Promise.all([
    prisma.project.count(),
    prisma.personel.count(),
    prisma.attendanceRecord.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.reminder.findMany({
      where: {
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        isCompleted: false
      },
      include: {
        project: true
      },
      orderBy: { date: 'asc' },
      take: 10
    }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    // Financial summary
    prisma.personelPayment.aggregate({
      _sum: { amount: true },
      where: {
        type: 'PRIM' // Consider payments as revenue
      }
    }),
    prisma.personelPayment.aggregate({
      _sum: { amount: true },
      where: {
        type: { in: ['AVANS', 'ELDEN'] } // Consider advances as expenses
      }
    }),
    // Low stock count
    prisma.inventory.count({
      where: {
        quantity: {
          lt: 10 // Items with quantity less than 10
        }
      }
    })
  ])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            Ana Gösterge Paneli
          </h1>
          <p className="text-slate-400 mt-1">
            Hoş geldiniz, {session?.user?.name || 'Admin'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Weather Widget */}
        <div className="mb-6">
          <WeatherWidget city="İstanbul" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Active Projects */}
          <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 rounded-xl p-6 border border-blue-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{totalProjects}</span>
            </div>
            <p className="text-slate-300 font-medium">Aktif Projeler</p>
            <p className="text-slate-500 text-sm mt-1">Devam eden inşaat projeleri</p>
          </div>

          {/* Registered Personnel */}
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 rounded-xl p-6 border border-purple-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{totalPersonnel}</span>
            </div>
            <p className="text-slate-300 font-medium">Kayıtlı Personel</p>
            <p className="text-slate-500 text-sm mt-1">Sistemde kayıtlı işçiler</p>
          </div>

          {/* Workers on Site Today */}
          <div className="bg-gradient-to-br from-green-900/50 to-slate-900 rounded-xl p-6 border border-green-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{todayCheckins}</span>
            </div>
            <p className="text-slate-300 font-medium">Bugün Sahadaki İşçi</p>
            <p className="text-slate-500 text-sm mt-1">Giriş yapmış personel</p>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-gradient-to-br from-orange-900/50 to-slate-900 rounded-xl p-6 border border-orange-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{upcomingReminders.length}</span>
            </div>
            <p className="text-slate-300 font-medium">Yaklaşan Görevler</p>
            <p className="text-slate-500 text-sm mt-1">Sonraki 7 gün içinde</p>
          </div>
        </div>

        {/* Financial & Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Total Cash Flow */}
          <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 rounded-xl p-6 border border-emerald-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">
                ₺{((totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0)).toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="text-slate-300 font-medium">💰 Toplam Kasa</p>
            <p className="text-slate-500 text-sm mt-1">Gelir - Gider</p>
          </div>

          {/* Low Stock Warning */}
          <div className="bg-gradient-to-br from-red-900/50 to-slate-900 rounded-xl p-6 border border-red-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m8 4V17" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{lowStockCount}</span>
            </div>
            <p className="text-slate-300 font-medium">📦 Kritik Stok Uyarısı</p>
            <p className="text-slate-500 text-sm mt-1">Eşiğin altındaki malzemeler</p>
          </div>
        </div>

        {/* Financial Chart */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Finansal Akış Grafiği</h2>
            <Link href="/admin/finance" className="text-blue-400 hover:text-blue-300 text-sm">
              Detaylı Finans →
            </Link>
          </div>
          <FinancialChart 
            data={[
              { month: 'Ocak', gelir: 150000, gider: 120000 },
              { month: 'Şubat', gelir: 180000, gider: 140000 },
              { month: 'Mart', gelir: 200000, gider: 150000 },
              { month: 'Nisan', gelir: 220000, gider: 160000 },
              { month: 'Mayıs', gelir: 190000, gider: 145000 },
              { month: 'Haziran', gelir: 250000, gider: 180000 },
            ]}
          />
        </div>

        {/* Dual Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upcoming Events */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Yaklaşan Şantiye Etkinlikleri</h2>
              <Link href="/admin/projects" className="text-blue-400 hover:text-blue-300 text-sm">
                Tümünü Gör →
              </Link>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Yaklaşan etkinlik yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{reminder.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">
                          {reminder.project?.name || 'Proje belirtilmemiş'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded text-xs">
                            {new Date(reminder.date).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                            {new Date(reminder.date).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/projects/${reminder.projectId}`}
                        className="ml-4 text-blue-400 hover:text-blue-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Recent System Movements */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Son Sistem Hareketleri</h2>
              <Link href="/admin/logs" className="text-blue-400 hover:text-blue-300 text-sm">
                Tümünü Gör →
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Henüz log kaydı yok</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log, index) => (
                  <div key={log.id} className="relative pl-6 pb-4 last:pb-0">
                    {index !== recentLogs.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-slate-700" />
                    )}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900" />
                    <div className="mb-1">
                      <span className="text-white font-medium text-sm">{log.user}</span>
                      <span className="text-slate-500 text-xs ml-2">
                        {new Date(log.createdAt).toLocaleString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{log.action}</p>
                    <p className="text-slate-500 text-xs">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/projects"
              className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">Projeler</div>
                <div className="text-sm text-slate-400">Proje yönetimi</div>
              </div>
            </Link>
            <Link
              href="/admin/workers"
              className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">Personel</div>
                <div className="text-sm text-slate-400">İşçi yönetimi</div>
              </div>
            </Link>
            <Link
              href="/admin/logs"
              className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">Loglar</div>
                <div className="text-sm text-slate-400">Sistem kayıtları</div>
              </div>
            </Link>
            <Link
              href="/admin/finance"
              className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">Finans</div>
                <div className="text-sm text-slate-400">Gelir-gider</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}