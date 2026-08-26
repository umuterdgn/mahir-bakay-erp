"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  Home,
  User,
  Settings,
  QrCode,
  Clock,
  Wallet,
  Package,
  ShieldAlert,
  Calendar,
  Bell,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ClipboardList,
  ClipboardCheck,
  ShoppingCart
} from "lucide-react"

export default function PersonnelSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: "/personnel", label: "Ana Sayfa", icon: Home },
    { href: "/personnel/tasks", label: "Görevlerim / İş Emirleri", icon: ClipboardList },
    { href: "/personnel/requests", label: "Malzeme Talepleri", icon: ShoppingCart },
    { href: "/personnel/profile", label: "Profil ve Ayarlar", icon: User },
    { href: "/personnel/qr-checkin", label: "QR Giriş/Çıkış", icon: QrCode },
    { href: "/personnel/attendance", label: "Mesai Geçmişi", icon: Clock },
    { href: "/personnel/salary", label: "Maaş ve Avans", icon: Wallet },
    { href: "/personnel/equipment", label: "Zimmetli Ekipmanlar", icon: Package },
    { href: "/personnel/audits", label: "Denetim Raporları", icon: ClipboardCheck },
    { href: "/personnel/isg", label: "İSG Bildirimleri", icon: ShieldAlert },
    { href: "/personnel/leave", label: "İzin Yönetimi", icon: Calendar },
    { href: "/personnel/announcements", label: "Duyurular ve Belgeler", icon: Bell },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-40 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(true)}
            className="text-white p-2 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
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
        className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">MB</span>
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-white">Şantiye Asistanı</h1>
                  <p className="text-slate-400 text-xs">Mahir Bakay Mühendislik</p>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex text-slate-400 hover:text-white p-1"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          {!isCollapsed && (
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{session?.user?.name || "Personel"}</p>
                  <p className="text-slate-400 text-xs truncate">Saha Mühendisi</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={`w-full px-4 py-3 rounded-lg bg-red-600/10 hover:bg-red-600 transition-all text-red-400 hover:text-white flex items-center gap-3 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Çıkış Yap</span>}
            </button>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-white p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </aside>
    </>
  )
}
