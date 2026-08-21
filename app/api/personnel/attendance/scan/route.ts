/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrData } = body

    if (!qrData) {
      return NextResponse.json(
        { error: "QR data is required" },
        { status: 400 }
      )
    }

    // Get personelId from session
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum bulunamadı. Lütfen giriş yapın." },
        { status: 401 }
      )
    }

    const personel = await prisma.personel.findFirst({
      where: { userId: session.user.id }
    })

    if (!personel) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      )
    }

    const personelId = personel.id

    // Parse projectId from QR data or fallback to first project
    let projectId: string | null = null

    try {
      // Try to parse QR data as JSON
      const qrParsed = JSON.parse(qrData)
      if (qrParsed.projectId) {
        projectId = qrParsed.projectId
      }
    } catch {
      // QR data is not JSON, use fallback
    }

    // Fallback to first project if no projectId found
    if (!projectId) {
      const firstProject = await prisma.project.findFirst()
      projectId = firstProject?.id || null
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Sistemde kayıtlı proje bulunamadı. Lütfen admin panelinden bir proje ekleyin." },
        { status: 400 }
      )
    }

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if there's an existing record for this personel for today
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        personelId,
        projectId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    const now = new Date()

    // Case 1: No record exists - Check-in
    if (!existingRecord) {
      const newRecord = await prisma.attendanceRecord.create({
        data: {
          personelId,
          projectId,
          date: today,
          checkIn: now,
          status: "PRESENT"
        }
      })

      return NextResponse.json({
        success: true,
        action: "check-in",
        message: "Mesaiye Başladınız",
        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        record: newRecord
      })
    }

    // Case 2: Record exists but checkOut is null - Check-out
    if (existingRecord && !existingRecord.checkOut) {
      const updatedRecord = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: {
          checkOut: now
        }
      })

      return NextResponse.json({
        success: true,
        action: "check-out",
        message: "Mesaiyi Bitirdiniz",
        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        record: updatedRecord
      })
    }

    // Case 3: Both checkIn and checkOut are filled - Error
    if (existingRecord && existingRecord.checkOut) {
      return NextResponse.json({
        success: false,
        error: "Bugün için mesai giriş-çıkış işleminiz zaten tamamlanmıştır",
        record: existingRecord
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Attendance scan error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
