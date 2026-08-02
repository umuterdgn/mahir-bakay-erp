import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnAdminPanel = req.nextUrl.pathname.startsWith("/admin")
  const isOnLoginPage = req.nextUrl.pathname === "/login"

  if (isOnAdminPanel && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/login"]
}