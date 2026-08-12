"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { CheckCircle, Clock, Circle, LogOut } from "lucide-react"

export default function MyTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [workerId, setWorkerId] = useState<string | null>(null)

  useEffect(() => {
    // Worker session cookie'dan al
    const workerSession = document.cookie
      .split('; ')
      .find(row => row.startsWith('worker_session='))
    
    if (workerSession) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(workerSession.split('=')[1]))
        
        // Eğer kullanıcının rolü ADMIN veya SUPER_ADMIN ise admin paneline yönlendir
        if (sessionData.role === "ADMIN" || sessionData.role === "SUPER_ADMIN") {
          router.push("/admin/tasks")
          return
        }
        
        // Worker ise görevlerini yükle
        setWorkerId(sessionData.id)
        fetchTasks(sessionData.id)
      } catch (error) {
        console.error("Session parse error:", error)
        setIsLoading(false)
      }
    } else {
      // Session yoksa erişim reddedildi mesajı göster
      setIsLoading(false)
    }
  }, [router])

  const fetchTasks = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?workerId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ))
        toast.success("Görev durumu güncellendi")
      } else {
        toast.error("Görev güncellenemedi")
      }
    } catch (error) {
      toast.error("Hata oluştu")
    }
  }

  const handleLogout = () => {
    document.cookie = "worker_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  const todoTasks = tasks.filter(t => t.status === "TODO")
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS")
  const doneTasks = tasks.filter(t => t.status === "DONE")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  if (!workerId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Bu sayfaya erişim izniniz yok</h1>
          <p className="text-slate-400 mb-4">Bu sayfa sadece işçiler için tasarlanmıştır.</p>
          <button
            onClick={() => window.location.href = "/admin"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Admin Paneline Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Görevlerim</h1>
          <p className="text-slate-400">Atanan görevlerinizi buradan yönetebilirsiniz</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Circle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Bekleyenler</h2>
            <span className="ml-auto bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm">
              {todoTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
              />
            ))}
            {todoTasks.length === 0 && (
              <div className="text-center text-slate-500 py-8">Görev yok</div>
            )}
          </div>
        </div>

        {/* IN_PROGRESS Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Yapılıyor</h2>
            <span className="ml-auto bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center text-slate-500 py-8">Görev yok</div>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-white">Tamamlandı</h2>
            <span className="ml-auto bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
              />
            ))}
            {doneTasks.length === 0 && (
              <div className="text-center text-slate-500 py-8">Görev yok</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onStatusChange }: { task: any; onStatusChange: (status: string) => void }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <h3 className="text-white font-medium mb-2">{task.title}</h3>
      {task.description && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex gap-2">
        {task.status !== "TODO" && (
          <button
            onClick={() => onStatusChange("TODO")}
            className="flex-1 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 text-sm"
          >
            Bekle
          </button>
        )}
        {task.status !== "IN_PROGRESS" && (
          <button
            onClick={() => onStatusChange("IN_PROGRESS")}
            className="flex-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 text-sm"
          >
            Başla
          </button>
        )}
        {task.status !== "DONE" && (
          <button
            onClick={() => onStatusChange("DONE")}
            className="flex-1 px-3 py-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 text-sm"
          >
            Bitir
          </button>
        )}
      </div>
    </div>
  )
}
