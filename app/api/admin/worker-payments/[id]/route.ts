import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { amount, type, description } = body

    const payment = await prisma.workerPayment.update({
      where: { id: resolvedParams.id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description })
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error updating worker payment:", error)
    return NextResponse.json(
      { error: "Ödeme güncellenirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    await prisma.workerPayment.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting worker payment:", error)
    return NextResponse.json(
      { error: "Ödeme silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
