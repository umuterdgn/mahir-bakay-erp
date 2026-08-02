import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await prisma.financeRecord.findMany({
      orderBy: { date: "desc" }
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Finance records fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, description, category } = body

    const record = await prisma.financeRecord.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category
      }
    })

    revalidatePath("/admin/finance")

    return NextResponse.json(record)
  } catch (error) {
    console.error("Finance record create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
