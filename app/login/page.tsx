"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */


import { motion } from "framer-motion"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"admin" | "worker">("admin")
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: ""
  })
  const [workerFormData, setWorkerFormData] = useState({
    username: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: adminFormData.email,
        password: adminFormData.password,
        redirect: false
      })

      if (result?.error) {
        setError("Geçersiz e-posta veya şifre")
      } else {
        router.push("/admin")
        router.refresh()
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: workerFormData.username,
        password: workerFormData.password,
        redirect: false
      })

      if (result?.error) {
        setError("Geçersiz kullanıcı adı veya şifre")
      } else {
        router.push("/personnel")
        router.refresh()
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleWorkerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkerFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Nexa ERP
            </h1>
            <p className="text-slate-300">
              Mahir Bakay Mühendislik Yönetim Sistemi
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yönetici Girişi
            </button>
            <button
              onClick={() => setActiveTab("worker")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === "worker"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Personel Girişi
            </button>
          </div>

          {/* Admin Form */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={adminFormData.email}
                  onChange={handleAdminChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="admin@nexa.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={adminFormData.password}
                  onChange={handleAdminChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? "Giriş Yapılıyor..." : "Yönetici Paneline Git"}
              </button>
            </form>
          )}

          {/* Worker Form */}
          {activeTab === "worker" && (
            <form onSubmit={handleWorkerSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={workerFormData.username}
                  onChange={handleWorkerChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="ahmet.yilmaz"
                />
              </div>

              <div>
                <label htmlFor="workerPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  id="workerPassword"
                  name="password"
                  required
                  value={workerFormData.password}
                  onChange={handleWorkerChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-500 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? "Giriş Yapılıyor..." : "Görevlerime Git"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}