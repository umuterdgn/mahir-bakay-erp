import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli" }, { status: 400 })
    }

    const worker = await prisma.worker.findUnique({
      where: { username }
    })

    if (!worker) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, worker.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre" }, { status: 401 })
    }

    // Worker session başlatma (basit cookie-based session)
    const response = NextResponse.json({ success: true, workerId: worker.id })
    
    // Worker bilgilerini cookie'e kaydet
    response.cookies.set("worker_session", JSON.stringify({
      id: worker.id,
      username: worker.username,
      role: "WORKER",
      projectId: worker.projectId
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    })

    return response
  } catch (error) {
    console.error("Worker auth error:", error)
    return NextResponse.json({ error: "Giriş hatası" }, { status: 500 })
  }
}
