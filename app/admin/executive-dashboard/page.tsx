/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface DashboardData {
  kpis: {
    totalProjects: number
    onSiteWorkers: number
    criticalNCRs: number
    assignedEquipmentPercentage: number
  }
  taskDistribution: Array<{
    projectTitle: string
    completed: number
    pending: number
  }>
  personnelDistribution: Array<{
    projectTitle: string
    count: number
  }>
  recentEvents: Array<{
    type: string
    title: string
    project: string
    date: string
  }>
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/executive-dashboard")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="lg:mt-0 mt-16 p-6">
        <div className="text-center py-12 text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="lg:mt-0 mt-16 p-6">
        <div className="text-center py-12 text-slate-400">Veri yüklenemedi</div>
      </div>
    )
  }

  return (
    <div className="lg:mt-0 mt-16 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Executive Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Holding üst yönetim özet paneli</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Toplam Proje"
          value={data.kpis.totalProjects}
          icon="🏗️"
          color="from-blue-600 to-indigo-600"
          subtitle="Aktif şantiyeler"
        />
        <KPICard
          title="Sahada Çalışan"
          value={data.kpis.onSiteWorkers}
          icon="👷"
          color="from-emerald-600 to-teal-600"
          subtitle="Bugün check-in"
        />
        <KPICard
          title="Kritik DÖF"
          value={data.kpis.criticalNCRs}
          icon="⚠️"
          color="from-red-600 to-pink-600"
          subtitle="Gecikmiş raporlar"
        />
        <KPICard
          title="Zimmetli Ekipman"
          value={`${data.kpis.assignedEquipmentPercentage}%`}
          icon="🔧"
          color="from-amber-600 to-orange-600"
          subtitle="Kullanımda"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Progress Bar Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Proje Bazlı İş İlerlemesi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="projectTitle" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="completed" name="Tamamlanan" fill="#10b981" />
              <Bar dataKey="pending" name="Bekleyen" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Personnel Distribution Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Personel Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.personnelDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ projectTitle, count, percent }) => 
                  `${projectTitle}: ${count} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.personnelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events Feed */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">Son Olaylar</h3>
        <div className="space-y-4">
          {data.recentEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Henüz olay yok</div>
          ) : (
            data.recentEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="text-2xl">
                  {event.type === "DRONE_MEDIA" ? "📸" : "💬"}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{event.title}</div>
                  <div className="text-sm text-slate-400">
                    {event.project} • {new Date(event.date).toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: number | string
  icon: string
  color: string
  subtitle: string
}

function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <div className={`px-3 py-1 bg-gradient-to-r ${color} text-white text-sm rounded-full`}>
          {subtitle}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{title}</div>
    </div>
  )
}
