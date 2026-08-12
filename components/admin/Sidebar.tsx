"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
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
  MessageSquare 
} from "lucide-react"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Kullanıcı bilgilerini session'dan al (İleride gerçek auth ile bağlanacak)
    // Şimdilik simüle edilmiş kullanıcı verisi
    const mockUser = {
      role: "SUPER_ADMIN", // "SUPER_ADMIN", "ADMIN", "SITE_MANAGER", "MUHASEBE", "STAFF", "WORKER"
      permissions: [] // Boş ise SUPER_ADMIN kabul edilir
    }
    setUser(mockUser)
  }, [])

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
  const isWorker = user?.role === "WORKER"
  const userPermissions = user?.permissions || []

  const allNavItems = [
    { href: "/admin", label: "Dashboard", requiredPermission: "DASHBOARD", icon: LayoutDashboard },
    { href: "/admin/cms", label: "İçerik Yönetimi", requiredPermission: null, icon: FileText },
    { href: "/admin/archive", label: "Arşiv", requiredPermission: "MARKUP", icon: Archive },
    { href: "/admin/finance", label: "Finans", requiredPermission: "FINANCE", icon: DollarSign },
    { href: "/admin/crm", label: "CRM / Firmalar", requiredPermission: null, icon: Building2 },
    { href: "/admin/projects", label: "Projeler", requiredPermission: "PROJECTS", icon: FolderKanban },
    { href: "/admin/inventory", label: "Ambar & Karekod", requiredPermission: "INVENTORY", icon: PackageSearch },
    { href: "/admin/personel", label: "Personel", requiredPermission: "PERSONNEL", icon: Users },
    { href: "/admin/site-reports", label: "Şantiye Günlüğü", requiredPermission: null, icon: ClipboardList },
    { href: "/admin/equipments", label: "Demirbaş", requiredPermission: null, icon: Wrench },
    { href: "/admin/calendar", label: "Takvim", requiredPermission: null, icon: Calendar },
    { href: "/admin/contracts", label: "Sözleşmeler", requiredPermission: null, icon: FileSignature },
    { href: "/admin/chat", label: "Sohbet", requiredPermission: null, icon: MessageSquare },
    { href: "/admin/attendance", label: "Puantaj & Personel", requiredPermission: "ATTENDANCE", icon: UserCheck },
    { href: "/admin/tasks", label: "Yapılacaklar", requiredPermission: "TASKS", icon: CheckSquare },
    { href: "/admin/my-tasks", label: "Görevlerim", requiredPermission: null, icon: CheckSquare, workerOnly: true },
    { href: "/admin/logs", label: "Sistem Logları", requiredPermission: null, icon: FileLog },
    { href: "/admin/users", label: "Kullanıcılar", requiredPermission: null, icon: Users },
    { href: "/admin/ayarlar", label: "Ayarlar", requiredPermission: null, icon: Settings },
  ]

  // Yetki bazlı menü filtreleme
  const navItems = allNavItems.filter(item => {
    // Worker sadece Görevlerim menüsünü görür
    if (isWorker) {
      return item.workerOnly === true
    }
    
    // Admin ve Super Admin workerOnly menüleri görmemeli
    if (item.workerOnly === true) {
      return false
    }
    
    // Admin ve diğer roller için yetki kontrolü
    if (isAdmin) return true // Admin tüm diğer menüleri görür
    if (!item.requiredPermission) return true // Yetki gerektirmeyen menüler
    return userPermissions.includes(item.requiredPermission)
  })

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
          <h1 className="text-white font-semibold">Admin Panel</h1>
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
            <h1 className="text-xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Mahir Bakay Mühendislik</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
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
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white text-left"
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
