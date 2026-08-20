/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

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
    // Allow all authenticated users to access admin routes
  }

  if (isOnAdminPanel && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Non-personnel users trying to access personnel routes should be redirected to admin
  if (isOnPersonnelPage && isLoggedIn) {
    // Allow all authenticated users to access personnel routes
  }

  if (isOnPersonnelPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isOnLoginPage && isLoggedIn) {
    // Redirect based on role - default to admin for all users
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/login", "/personnel/:path*"]
}