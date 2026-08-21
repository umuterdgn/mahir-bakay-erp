/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PersonnelSidebar from "@/components/PersonnelSidebar"
import NextAuthSessionProvider from "@/components/providers/SessionProvider"

export default async function PersonnelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userRole = session.user?.role as string
  const isPersonnel = userRole === "STAFF" || userRole === "WORKER"

  if (!isPersonnel) {
    redirect("/admin")
  }

  return (
    <NextAuthSessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <PersonnelSidebar />
        <main className="lg:ml-72 p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </NextAuthSessionProvider>
  )
}
