"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { useState } from "react"
import { ChevronDown, ChevronRight, Building2, Layers } from "lucide-react"

interface StructureItem {
  id: string
  name: string
  status: "completed" | "in_progress" | "pending"
  children?: StructureItem[]
}

interface StructureTreeProps {
  structure?: StructureItem[]
}

export default function StructureTree({ structure }: StructureTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const defaultStructure: StructureItem[] = structure || [
    {
      id: "temel",
      name: "Temel",
      status: "completed",
      children: [
        { id: "temel-kazi", name: "Kazı", status: "completed" },
        { id: "temel-donati", name: "Donatı", status: "completed" },
        { id: "temel-beton", name: "Beton", status: "completed" },
      ]
    },
    {
      id: "bodrum",
      name: "Bodrum",
      status: "completed",
      children: [
        { id: "bodrum-kolon", name: "Kolon", status: "completed" },
        { id: "bodrum-perde", name: "Perde Duvar", status: "completed" },
        { id: "bodrum-doseme", name: "Döşeme", status: "completed" },
      ]
    },
    {
      id: "zemin",
      name: "Zemin Kat",
      status: "in_progress",
      children: [
        { id: "zemin-kolon", name: "Kolon", status: "completed" },
        { id: "zemin-kiris", name: "Kiriş", status: "in_progress" },
        { id: "zemin-doseme", name: "Döşeme", status: "pending" },
      ]
    },
    {
      id: "1kat",
      name: "1. Kat",
      status: "pending",
      children: [
        { id: "1kat-kolon", name: "Kolon", status: "pending" },
        { id: "1kat-kiris", name: "Kiriş", status: "pending" },
        { id: "1kat-doseme", name: "Döşeme", status: "pending" },
      ]
    },
    {
      id: "2kat",
      name: "2. Kat",
      status: "pending",
      children: [
        { id: "2kat-kolon", name: "Kolon", status: "pending" },
        { id: "2kat-kiris", name: "Kiriş", status: "pending" },
        { id: "2kat-doseme", name: "Döşeme", status: "pending" },
      ]
    },
    {
      id: "cati",
      name: "Çatı",
      status: "pending",
      children: [
        { id: "cati-kiremit", name: "Kiremit/Çatı Kaplama", status: "pending" },
        { id: "cati-izolasyon", name: "İzolasyon", status: "pending" },
      ]
    },
  ]

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="w-3 h-3 rounded-full bg-green-500" />
      case "in_progress":
        return <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
      case "pending":
        return <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı"
      case "in_progress":
        return "Devam Ediyor"
      case "pending":
        return "Bekliyor"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "in_progress":
        return "text-orange-600 dark:text-orange-400"
      case "pending":
        return "text-slate-500 dark:text-slate-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const renderTreeItem = (item: StructureItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            level > 0 ? "ml-4" : ""
          }`}
          onClick={() => hasChildren && toggleExpand(item.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
          
          {level === 0 ? (
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Layers className="w-4 h-4 text-slate-400" />
          )}
          
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">
            {item.name}
          </span>
          
          {getStatusIcon(item.status)}
          
          <span className={`text-xs ${getStatusColor(item.status)}`}>
            {getStatusLabel(item.status)}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Yapı Ağacı (Dijital İkiz)
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Tamamlandı
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Devam Ediyor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            Bekliyor
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {defaultStructure.map((item) => renderTreeItem(item))}
      </div>
    </div>
  )
}
