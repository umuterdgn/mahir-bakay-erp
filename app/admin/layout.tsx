/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

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
        <main className="lg:ml-64 pt-20 lg:pt-6 p-6 lg:p-8">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </div>
    </NextAuthSessionProvider>
  )
}