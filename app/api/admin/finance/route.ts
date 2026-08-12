import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Yardımcı fonksiyon: Yetki kontrolü
function hasPermission(user: any, permission: string): boolean {
  if (!user) return false
  if (user.role === "SUPER_ADMIN") return true
  if (Array.isArray(user.permissions) && user.permissions.includes(permission)) return true
  return false
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Finans modülü için yetki kontrolü
    if (!hasPermission(session.user, "FINANCE")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        project: true,
        company: true,
        personnel: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "İşlemler getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Finans modülü için yetki kontrolü
    if (!hasPermission(session.user, "FINANCE")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    
    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: parseFloat(data.amount.toString()),
        description: data.description,
        category: data.category,
        personnelId: data.personnelId || null,
        projectId: data.projectId || null,
        companyId: data.companyId || null
      },
      include: {
        project: true,
        company: true,
        personnel: true
      }
    })
    
    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Finance POST Error:", error)
    return NextResponse.json({ error: "İşlem kaydedilemedi" }, { status: 500 })
  }
}
