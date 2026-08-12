import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID required" },
        { status: 400 }
      )
    }

    const payments = await prisma.workerPayment.findMany({
      where: { workerId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching worker payments:", error)
    return NextResponse.json(
      { error: "Ödemeler getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, type, description, workerId } = body

    if (!amount || !type || !workerId) {
      return NextResponse.json(
        { error: "Amount, type and workerId are required" },
        { status: 400 }
      )
    }

    if (!["AVANS", "ELDEN", "PRIM"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of: AVANS, ELDEN, PRIM" },
        { status: 400 }
      )
    }

    const payment = await prisma.workerPayment.create({
      data: {
        amount: parseFloat(amount),
        type,
        description: description || null,
        workerId
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating worker payment:", error)
    return NextResponse.json(
      { error: "Ödeme oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
