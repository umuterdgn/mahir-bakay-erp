import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logAction } from "@/lib/logger"

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(workers)
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: "İşçiler getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, username, password, team, projectId } = body

    if (!firstName || !lastName || !username || !password || !projectId) {
      return NextResponse.json(
        { error: "Tüm zorunlu alanları doldurun" },
        { status: 400 }
      )
    }

    // Kullanıcı adı benzersiz mi kontrol et
    const existingWorker = await prisma.worker.findUnique({
      where: { username }
    })

    if (existingWorker) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanımda" },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    const worker = await prisma.worker.create({
      data: {
        firstName,
        lastName,
        username,
        password: hashedPassword,
        team: team || null,
        projectId
      },
      include: {
        project: true
      }
    })

    // Log the action
    await logAction("PERSONEL_EKLENDI", `${worker.firstName} ${worker.lastName} adlı personel oluşturuldu.`, "Admin")

    return NextResponse.json(worker, { status: 201 })
  } catch (error) {
    console.error("Error creating worker:", error)
    return NextResponse.json(
      { error: "İşçi oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Worker ID required" }, { status: 400 })
    }

    const worker = await prisma.worker.findUnique({ where: { id } })
    await prisma.worker.delete({
      where: { id }
    })

    // Log the action
    await logAction("PERSONEL_SILINDI", `${worker?.firstName} ${worker?.lastName} adlı personel silindi.`, "Admin")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting worker:", error)
    return NextResponse.json(
      { error: "İşçi silinirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, dailyWage, monthlyBankPayment } = body

    if (!id) {
      return NextResponse.json(
        { error: "Worker ID required" },
        { status: 400 }
      )
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        ...(dailyWage !== undefined && { dailyWage: parseFloat(dailyWage) || 0 }),
        ...(monthlyBankPayment !== undefined && { monthlyBankPayment: parseFloat(monthlyBankPayment) || 0 })
      },
      include: {
        project: true
      }
    })

    // Log the action
    await logAction("PERSONEL_GUNCELLENDI", `${worker.firstName} ${worker.lastName} adlı personelin ücret bilgileri güncellendi.`, "Admin")

    return NextResponse.json(worker)
  } catch (error) {
    console.error("Error updating worker:", error)
    return NextResponse.json(
      { error: "İşçi güncellenirken hata oluştu" },
      { status: 500 }
    )
  }
}