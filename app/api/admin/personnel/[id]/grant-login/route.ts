import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { email, password, role, username } = body

    // Check if personnel exists
    const personnel = await prisma.personel.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!personnel) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create User
    const user = await prisma.user.create({
      data: {
        name: personnel.name,
        email,
        password: hashedPassword,
        role: role || "STAFF"
      }
    })

    // Update personnel with userId
    const updatedPersonnel = await prisma.personel.update({
      where: { id: resolvedParams.id },
      data: { userId: user.id }
    })

    return NextResponse.json({ 
      success: true, 
      user,
      personnel: updatedPersonnel
    })
  } catch (error) {
    console.error("Error granting login access:", error)
    return NextResponse.json({ error: "Giriş izni verilirken hata oluştu" }, { status: 500 })
  }
}
