import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deliveries = await prisma.pPEDelivery.findMany({
      include: {
        personel: {
          select: {
            id: true,
            name: true,
            personnelNo: true,
            department: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Parse equipment JSON
    const deliveriesWithParsedEquipment = deliveries.map(delivery => ({
      ...delivery,
      equipment: JSON.parse(delivery.equipment)
    }))

    return NextResponse.json(deliveriesWithParsedEquipment)
  } catch (error) {
    console.error("Failed to fetch PPE deliveries:", error)
    return NextResponse.json(
      { error: "Failed to fetch PPE deliveries" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { equipment, signature, personelId } = body

    const delivery = await prisma.pPEDelivery.create({
      data: {
        equipment: JSON.stringify(equipment),
        signature,
        personelId
      },
      include: {
        personel: {
          select: {
            id: true,
            name: true,
            personnelNo: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      ...delivery,
      equipment: JSON.parse(delivery.equipment)
    })
  } catch (error) {
    console.error("Failed to create PPE delivery:", error)
    return NextResponse.json(
      { error: "Failed to create PPE delivery" },
      { status: 500 }
    )
  }
}
