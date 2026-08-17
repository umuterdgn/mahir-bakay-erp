import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/Sidebar"
import { Toaster } from "react-hot-toast"
import NextAuthSessionProvider from "@/components/providers/SessionProvider"

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
    <NextAuthSessionProvider>
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar />
        <main className="lg:ml-64 p-6 lg:p-8">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </div>
    </NextAuthSessionProvider>
  )
}