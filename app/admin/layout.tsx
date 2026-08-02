import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/Sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="lg:ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}