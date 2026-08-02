"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/cms", label: "İçerik Yönetimi" },
    { href: "/admin/archive", label: "Arşiv" },
    { href: "/admin/finance", label: "Finans" },
    { href: "/admin/stock", label: "Stok" },
    { href: "/admin/personel", label: "Personel" },
    { href: "/admin/users", label: "Kullanıcılar" },
    { href: "/admin/ayarlar", label: "Ayarlar" },
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-800">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white text-left"
              >
                Çıkış Yap
              </button>
            </form>
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
