import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10)
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@mahirbakay.com" },
      update: {},
      create: {
        email: "admin@mahirbakay.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        permissions: {
          create: [
            { page: "dashboard", canRead: true, canWrite: true, canDelete: true },
            { page: "cms", canRead: true, canWrite: true, canDelete: true },
            { page: "archive", canRead: true, canWrite: true, canDelete: true },
            { page: "finance", canRead: true, canWrite: true, canDelete: true },
            { page: "stock", canRead: true, canWrite: true, canDelete: true },
            { page: "staff", canRead: true, canWrite: true, canDelete: true },
            { page: "users", canRead: true, canWrite: true, canDelete: true }
          ]
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Admin user created via GET",
      email: admin.email,
      password: "123456"
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@mahirbakay.com" },
      update: {},
      create: {
        email: "admin@mahirbakay.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        permissions: {
          create: [
            { page: "dashboard", canRead: true, canWrite: true, canDelete: true },
            { page: "cms", canRead: true, canWrite: true, canDelete: true },
            { page: "archive", canRead: true, canWrite: true, canDelete: true },
            { page: "finance", canRead: true, canWrite: true, canDelete: true },
            { page: "stock", canRead: true, canWrite: true, canDelete: true },
            { page: "staff", canRead: true, canWrite: true, canDelete: true },
            { page: "users", canRead: true, canWrite: true, canDelete: true }
          ]
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Admin user created",
      email: admin.email 
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}
