"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { CheckCircle, Clock, Circle } from "lucide-react"

interface TimelinePhase {
  id: string
  name: string
  date: string
  status: "completed" | "active" | "pending"
}

interface ProjectTimelineProps {
  phases?: TimelinePhase[]
}

export default function ProjectTimeline({ phases }: ProjectTimelineProps) {
  const defaultPhases: TimelinePhase[] = phases || [
    { id: "1", name: "Ruhsat Alındı", date: "12.05.2026", status: "completed" },
    { id: "2", name: "Temel Kazısı", date: "18.05.2026", status: "completed" },
    { id: "3", name: "Zemin Kat Donatı", date: "22.05.2026", status: "completed" },
    { id: "4", name: "1. Kat Beton", date: "Bugün", status: "active" },
    { id: "5", name: "2. Kat Kolon", date: "Bekleniyor", status: "pending" },
    { id: "6", name: "Çatı İşleri", date: "Bekleniyor", status: "pending" },
    { id: "7", name: "İç Dekorasyon", date: "Bekleniyor", status: "pending" },
    { id: "8", name: "Teslim", date: "Bekleniyor", status: "pending" },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Yapı Zaman Çizelgesi</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
          <div 
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${(defaultPhases.filter(p => p.status === "completed").length / defaultPhases.length) * 100}%` 
            }}
          />
        </div>

        {/* Timeline Items */}
        <div className="flex justify-between relative">
          {defaultPhases.map((phase, index) => {
            const Icon = phase.status === "completed" ? CheckCircle : 
                         phase.status === "active" ? Clock : Circle
            
            return (
              <div key={phase.id} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${phase.status === "completed" 
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500" 
                    : phase.status === "active"
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  }
                `}>
                  <Icon className={`w-5 h-5 ${
                    phase.status === "completed" 
                      ? "text-green-600 dark:text-green-400" 
                    : phase.status === "active"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`} />
                </div>
                
                <div className="mt-3 text-center max-w-[80px]">
                  <p className={`text-xs font-medium ${
                    phase.status === "completed" 
                      ? "text-slate-900 dark:text-white" 
                    : phase.status === "active"
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    {phase.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {phase.date}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Devam Ediyor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Bekliyor</span>
        </div>
      </div>
    </div>
  )
}
