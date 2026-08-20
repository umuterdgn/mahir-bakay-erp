/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.attendanceRecord.findMany({
      include: {
        personel: true,
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
    const { personelId, projectId, date, checkIn, checkOut, dayMultiplier } = body

    console.log("Attendance POST: Creating record with data:", { personelId, projectId, date, checkIn, checkOut, dayMultiplier })

    // Calculate dayMultiplier based on hours worked if not provided
    let calculatedDayMultiplier = dayMultiplier !== undefined ? dayMultiplier : 1

    if (calculatedDayMultiplier === undefined && checkIn && checkOut) {
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
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        personelId: personelId || null,
        projectId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        dayMultiplier: calculatedDayMultiplier
      }
    })

    console.log("Attendance POST: Record created successfully:", record)

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error creating attendance record:", error)
    return NextResponse.json(
      { error: "Yoklama kaydı oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}