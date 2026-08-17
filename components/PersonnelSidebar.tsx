"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  CheckSquare, 
  Wallet, 
  Clock,
  LogOut,
  Menu,
  X
} from "lucide-react"

export default function PersonnelSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: "/personnel", label: "Ana Sayfa", icon: CheckSquare },
    { href: "/personnel/my-tasks", label: "Görevlerim", icon: CheckSquare },
    { href: "/personnel/my-salary", label: "Maaş/Avans", icon: Wallet },
    { href: "/personnel/my-attendance", label: "Mesai Geçmişim", icon: Clock },
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
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-1">Şantiye Asistanı</h1>
            <p className="text-slate-400 text-sm">Mahir Bakay Mühendislik</p>
            {session?.user?.name && (
              <p className="text-slate-500 text-xs mt-2">{session.user.name}</p>
            )}
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
              className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white text-left flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
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
