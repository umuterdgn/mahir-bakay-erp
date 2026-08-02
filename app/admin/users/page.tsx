"use client"

import { useState } from "react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="lg:mt-0 mt-16">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
        Kullanıcı Yönetimi
      </h1>

      {/* Add User Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Yeni Kullanıcı Ekle
        </button>
      </div>

      {/* Users List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Ad Soyad</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">E-posta</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Rol</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Yetkiler</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm font-medium text-white">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "ADMIN"
                      ? "bg-purple-900/50 text-purple-400"
                      : "bg-blue-900/50 text-blue-400"
                  }`}>
                    {user.role === "ADMIN" ? "Admin" : "Personel"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {user.permissions?.length || 0} sayfa
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(updatedUser) => {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
            setSelectedUser(null)
          }}
        />
      )}

      {/* Add User Modal */}
      {isAdding && (
        <UserModal
          onClose={() => setIsAdding(false)}
          onSave={(newUser) => {
            setUsers([...users, newUser])
            setIsAdding(false)
          }}
        />
      )}
    </div>
  )

  function handleDelete(id: string) {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return
    
    try {
      fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      }).then(response => {
        if (response.ok) {
          setUsers(users.filter(u => u.id !== id))
        }
      })
    } catch (error) {
      alert("Hata oluştu")
    }
  }
}

function UserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "STAFF",
    permissions: user?.permissions || []
  })

  const pages = [
    { id: "dashboard", name: "Dashboard" },
    { id: "cms", name: "İçerik Yönetimi" },
    { id: "archive", name: "Arşiv" },
    { id: "finance", name: "Finans" },
    { id: "stock", name: "Stok" },
    { id: "staff", name: "Personel" },
    { id: "users", name: "Kullanıcılar" }
  ]

  const handlePermissionChange = (pageId: string, permissionType: "canRead" | "canWrite" | "canDelete") => {
    const existingPermission = formData.permissions.find((p: any) => p.page === pageId)
    
    if (existingPermission) {
      setFormData({
        ...formData,
        permissions: formData.permissions.map((p: any) =>
          p.page === pageId
            ? { ...p, [permissionType]: !p[permissionType] }
            : p
        )
      })
    } else {
      setFormData({
        ...formData,
        permissions: [
          ...formData.permissions,
          {
            page: pageId,
            canRead: permissionType === "canRead" ? true : false,
            canWrite: permissionType === "canWrite" ? true : false,
            canDelete: permissionType === "canDelete" ? true : false
          }
        ]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = user?.id ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user?.id ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const savedUser = await response.json()
        onSave(savedUser)
      }
    } catch (error) {
      alert("Hata oluştu")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {user?.id ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-posta *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {!user?.id && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                  required={!user?.id}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="STAFF">Personel</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sayfa Yetkileri</h3>
              <div className="space-y-4">
                {pages.map((page) => {
                  const permission = formData.permissions.find((p: any) => p.page === page.id)
                  return (
                    <div key={page.id} className="border border-slate-700 rounded-lg p-4">
                      <div className="font-medium text-white mb-3">{page.name}</div>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permission?.canRead || false}
                            onChange={() => handlePermissionChange(page.id, "canRead")}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                          />
                          <span className="text-sm text-slate-300">Okuma</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permission?.canWrite || false}
                            onChange={() => handlePermissionChange(page.id, "canWrite")}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                          />
                          <span className="text-sm text-slate-300">Yazma</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permission?.canDelete || false}
                            onChange={() => handlePermissionChange(page.id, "canDelete")}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                          />
                          <span className="text-sm text-slate-300">Silme</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}