import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const equipments = await prisma.equipment.findMany({
      include: {
        project: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(equipments)
  } catch (error) {
    console.error("Error fetching equipments:", error)
    return NextResponse.json(
      { error: "Demirbaşlar getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, status, plateOrSerialNo, nextMaintenance, projectId } = body

    const equipment = await prisma.equipment.create({
      data: {
        name,
        type: type || "DIGER",
        status: status || "AKTIF",
        plateOrSerialNo: plateOrSerialNo || null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
        projectId: projectId || null
      },
      include: {
        project: true
      }
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error("Error creating equipment:", error)
    return NextResponse.json(
      { error: "Demirbaş oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
