"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  FileText, 
  Archive, 
  DollarSign, 
  Building2, 
  FolderKanban, 
  Package, 
  Users, 
  ClipboardList, 
  Wrench, 
  Calendar, 
  FileSignature, 
  PackageSearch, 
  UserCheck, 
  CheckSquare, 
  FileText as FileLog, 
  Settings,
  MessageSquare,
  Wallet,
  Clock,
  TestTube,
  Shield,
  Hammer,
  FileCheck,
  Pen,
  FileSearch
} from "lucide-react"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const isPersonnel = session?.user?.role === "STAFF"
  const userPermissions = session?.user?.permissions || []

  const allNavItems = [
    { href: "/admin", label: "Dashboard", requiredPermission: "DASHBOARD", icon: LayoutDashboard, category: "ANA MENÜ" },
    { href: "/admin/calendar", label: "Takvim", requiredPermission: null, icon: Calendar, category: "ANA MENÜ" },
    { href: "/admin/site-reports", label: "Şantiye Günlüğü", requiredPermission: null, icon: ClipboardList, category: "ANA MENÜ" },
    { href: "/admin/personel", label: "Personeller", requiredPermission: "PERSONNEL", icon: Users, category: "İNSAN KAYNAKLARI" },
    { href: "/admin/attendance", label: "Puantaj & Mesai", requiredPermission: "ATTENDANCE", icon: UserCheck, category: "İNSAN KAYNAKLARI" },
    { href: "/admin/finance", label: "Kasa & Finans", requiredPermission: "FINANCE", icon: DollarSign, category: "FİNANS & TEDARİK" },
    { href: "/admin/inventory", label: "Ambar & Karekod", requiredPermission: "INVENTORY", icon: PackageSearch, category: "FİNANS & TEDARİK" },
    { href: "/admin/equipments", label: "Demirbaş", requiredPermission: null, icon: Wrench, category: "FİNANS & TEDARİK" },
    { href: "/admin/contracts", label: "Sözleşmeler", requiredPermission: null, icon: FileSignature, category: "FİNANS & TEDARİK" },
    { href: "/admin/projects", label: "Projeler", requiredPermission: "PROJECTS", icon: FolderKanban, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/inspection/reports/create", label: "Hasar Tespit & Rapor", requiredPermission: null, icon: FileSearch, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/inspection", label: "Numune & Karot Takip", requiredPermission: null, icon: TestTube, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/inspection/reinforcement", label: "Demir & Kalıp Kontrol", requiredPermission: null, icon: Hammer, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/inspection/attachment", label: "Ataşman & Delil", requiredPermission: null, icon: FileCheck, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/inspection/documents", label: "Ruhsat & Evrak Arşivi", requiredPermission: null, icon: Archive, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/blueprints", label: "Dijital Projeler / Çizimler", requiredPermission: null, icon: FileText, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/blueprints/draw", label: "Serbest Çizim / Plan", requiredPermission: null, icon: Pen, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/isg", label: "İSG Bildirimleri", requiredPermission: null, icon: Shield, category: "YAPI DENETİM & KONTROL" },
    { href: "/admin/crm", label: "CRM / Firmalar", requiredPermission: null, icon: Building2, category: "PROJE & CRM" },
    { href: "/admin/cms", label: "İçerik Yönetimi", requiredPermission: null, icon: FileText, category: "PROJE & CRM" },
    { href: "/admin/chat", label: "Sohbet", requiredPermission: null, icon: MessageSquare, category: "İLETİŞİM & SİSTEM" },
    { href: "/admin/users", label: "Kullanıcılar", requiredPermission: null, icon: Users, category: "İLETİŞİM & SİSTEM" },
    { href: "/admin/logs", label: "Sistem Logları", requiredPermission: null, icon: FileLog, category: "İLETİŞİM & SİSTEM" },
    { href: "/admin/ayarlar", label: "Ayarlar", requiredPermission: null, icon: Settings, category: "İLETİŞİM & SİSTEM" },
    { href: "/admin/my-tasks", label: "Görevlerim", requiredPermission: null, icon: CheckSquare, personnelOnly: true, category: "PERSONEL" },
    { href: "/admin/my-salary", label: "Maaş/Avans", requiredPermission: null, icon: Wallet, personnelOnly: true, category: "PERSONEL" },
    { href: "/admin/my-attendance", label: "Mesai Geçmişim", requiredPermission: null, icon: Clock, personnelOnly: true, category: "PERSONEL" },
  ]

  // Yetki bazlı menü filtreleme
  const navItems = allNavItems.filter(item => {
    // Personnel sadece personnelOnly menüleri görür
    if (isPersonnel) {
      return item.personnelOnly === true
    }
    
    // Admin ve Super Admin personnelOnly menüleri görmemeli
    if (item.personnelOnly === true) {
      return false
    }
    
    // Admin ve diğer roller için yetki kontrolü
    if (isAdmin) return true // Admin tüm diğer menüleri görür
    if (!item.requiredPermission) return true // Yetki gerektirmeyen menüler
    return userPermissions.includes(item.requiredPermission as string)
  })

  // Group items by category
  const groupedNavItems = navItems.reduce((acc, item) => {
    const category = item.category || "DİĞER"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-40 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(true)}
            className="text-white p-2 hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white font-semibold">Şantiye Asistanı</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-1">Şantiye Asistanı</h1>
            <p className="text-slate-400 text-sm">Mahir Bakay Mühendislik</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {Object.entries(groupedNavItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 mt-6">
                  {category}
                </h3>
                {items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-6 pb-8 border-t border-slate-800 mt-4">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white text-left relative z-10"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-white p-2 hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}
