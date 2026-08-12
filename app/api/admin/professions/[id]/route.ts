import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE - Meslek sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if profession has any personnel or workers assigned
    const personelCount = await prisma.personel.count({
      where: { professionId: id }
    })
    
    const workerCount = await prisma.worker.count({
      where: { professionId: id }
    })

    if (personelCount > 0 || workerCount > 0) {
      return NextResponse.json(
        { error: "Bu mesleğe atanmış personel veya işçi var. Önce personel/işçileri güncelleyin." },
        { status: 400 }
      )
    }

    await prisma.profession.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting profession:", error)
    return NextResponse.json(
      { error: "Meslek silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
