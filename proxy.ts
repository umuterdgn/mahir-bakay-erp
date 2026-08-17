import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnAdminPanel = req.nextUrl.pathname.startsWith("/admin")
  const isOnLoginPage = req.nextUrl.pathname === "/login"
  const isOnPersonnelPage = req.nextUrl.pathname.startsWith("/personnel")
  const userRole = req.auth?.user?.role

  // Personnel users trying to access admin routes should be redirected to personnel portal
  if (isOnAdminPanel && isLoggedIn) {
    const isPersonnel = userRole === "STAFF" || userRole === "WORKER"
    if (isPersonnel) {
      return NextResponse.redirect(new URL("/personnel", req.nextUrl))
    }
  }

  if (isOnAdminPanel && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Non-personnel users trying to access personnel routes should be redirected to admin
  if (isOnPersonnelPage && isLoggedIn) {
    const isPersonnel = userRole === "STAFF" || userRole === "WORKER"
    if (!isPersonnel) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }
  }

  if (isOnPersonnelPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isOnLoginPage && isLoggedIn) {
    // Redirect based on role
    const isPersonnel = userRole === "STAFF" || userRole === "WORKER"
    if (isPersonnel) {
      return NextResponse.redirect(new URL("/personnel", req.nextUrl))
    }
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/login", "/personnel/:path*"]
}