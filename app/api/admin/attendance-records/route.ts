import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.attendanceRecord.findMany({
      include: {
        worker: {
          include: {
            project: true
          }
        },
        project: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: "Yoklama kayıtları getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { workerId, projectId, date, checkIn, checkOut } = body

    // Get project shift hours
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    // Calculate dayMultiplier based on hours worked
    let calculatedDayMultiplier = 1

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      const hoursWorked = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)

      if (hoursWorked >= 8) {
        calculatedDayMultiplier = 1 // Tam Gün
      } else if (hoursWorked >= 4) {
        calculatedDayMultiplier = 0.5 // Yarım Gün
      } else {
        calculatedDayMultiplier = 0 // 4 saatten az
      }
    } else if (project?.shiftStart && project?.shiftEnd) {
      // Use project shift hours if no checkIn/checkOut provided
      const [startHour, startMin] = project.shiftStart.split(':').map(Number)
      const [endHour, endMin] = project.shiftEnd.split(':').map(Number)
      const shiftHours = (endHour + endMin / 60) - (startHour + startMin / 60)

      if (shiftHours >= 8) {
        calculatedDayMultiplier = 1
      } else if (shiftHours >= 4) {
        calculatedDayMultiplier = 0.5
      } else {
        calculatedDayMultiplier = 0
      }
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        workerId,
        projectId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        dayMultiplier: calculatedDayMultiplier
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error creating attendance record:", error)
    return NextResponse.json(
      { error: "Yoklama kaydı oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}