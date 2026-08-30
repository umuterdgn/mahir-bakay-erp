"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { BarChart, AlertTriangle, TrendingDown, Star, TrendingUp, Clock, Award } from "lucide-react"

export default function AnalyticsPage() {
  const bottleneckData = [
    {
      title: "En Çok Zaman Kaybedilen Süreç",
      value: "Belediye Ruhsat Onayları",
      detail: "Ort. +12 Gün Gecikme",
      icon: Clock,
      color: "red"
    },
    {
      title: "En Sorunlu Şantiye",
      value: "Arsuz Konutları",
      detail: "%18 Plan Gerisinde",
      icon: TrendingDown,
      color: "orange"
    },
    {
      title: "Kritik Hata Oranı",
      value: "Beton Döküm Hataları",
      detail: "Son 1 ayda 4 İhlal",
      icon: AlertTriangle,
      color: "red"
    }
  ]

  const contractorPerformance = [
    { name: "Yılmaz Kalıp", performance: 95, status: "Zamanında Teslim", color: "green" },
    { name: "Kaya Demir", performance: 60, status: "Gecikmeli Teslim", color: "red" },
    { name: "Öz Beton", performance: 88, status: "İyi Performans", color: "green" },
    { name: "Şahin İnşaat", performance: 72, status: "Orta Performans", color: "yellow" },
    { name: "Mert Malzeme", performance: 82, status: "İyi Performans", color: "green" }
  ]

  const siteSatisfaction = [
    { name: "İskenderun TOKİ", rating: 4.5, reviews: 12 },
    { name: "Arsuz Konutları", rating: 3.8, reviews: 8 },
    { name: "Dörtyol Sitesi", rating: 4.2, reviews: 15 },
    { name: "Erzin Proje", rating: 4.8, reviews: 6 }
  ]

  const timeLossTrend = [
    { month: "Mayıs", days: 8 },
    { month: "Haziran", days: 12 },
    { month: "Temmuz", days: 15 },
    { month: "Ağustos", days: 10 }
  ]

  const getProgressColor = (performance: number) => {
    if (performance >= 85) return "bg-green-500"
    if (performance >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCardColor = (color: string) => {
    switch (color) {
      case "red":
        return "from-red-600 to-rose-600"
      case "orange":
        return "from-orange-600 to-amber-600"
      default:
        return "from-red-600 to-rose-600"
    }
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-slate-600" />
        ))}
      </div>
    )
  }

  return (
    <div className="lg:mt-0 mt-16">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="w-8 h-8 text-blue-400" />
          Analitik & KPI
        </h1>
        <p className="text-slate-400 mt-1">Şantiye performans analitiği ve darboğaz takibi</p>
      </div>

      {/* Bottleneck Analysis */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Şantiye Gecikme Analizi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottleneckData.map((item, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${getCardColor(item.color)} rounded-xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <item.icon className="w-8 h-8 opacity-80" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">KPI</span>
              </div>
              <p className="text-sm opacity-90 mb-2">{item.title}</p>
              <p className="text-2xl font-bold mb-1">{item.value}</p>
              <p className="text-sm opacity-80">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Contractor Performance */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Taşeron Performansı
          </h3>
          <div className="space-y-4">
            {contractorPerformance.map((contractor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{contractor.name}</span>
                  <span className={`text-sm ${
                    contractor.color === "green" ? "text-green-400" : 
                    contractor.color === "yellow" ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {contractor.performance}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(contractor.performance)} transition-all`}
                    style={{ width: `${contractor.performance}%` }}
                  />
                </div>
                <p className={`text-xs ${
                  contractor.color === "green" ? "text-green-400" : 
                  contractor.color === "yellow" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {contractor.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Site Satisfaction */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Müşteri/Şantiye Memnuniyeti
          </h3>
          <div className="space-y-4">
            {siteSatisfaction.map((site, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{site.name}</p>
                  <p className="text-slate-400 text-sm">{site.reviews} değerlendirme</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{site.rating}</span>
                  {renderStars(site.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Loss Trend Chart */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Zaman Kaybı Eğilimi (Son 4 Ay)
        </h3>
        <div className="flex items-end justify-between h-64 gap-4">
          {timeLossTrend.map((data, index) => {
            const maxHeight = 200
            const barHeight = (data.days / 15) * maxHeight
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full bg-slate-800 rounded-t-lg flex items-end justify-center" style={{ height: `${maxHeight}px` }}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                    style={{ height: `${barHeight}px` }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold">
                      {data.days} gün
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-3 font-medium">{data.month}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-slate-400">Zaman Kaybı (Gün)</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Ağustos'ta iyileşme</span>
          </div>
        </div>
      </div>
    </div>
  )
}
