import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, projectId } = body

    if (!username || !password || !projectId) {
      return NextResponse.json(
        { error: "Kullanıcı adı, şifre ve proje ID zorunludur" },
        { status: 400 }
      )
    }

    // İşçiyi bul
    const worker = await prisma.worker.findUnique({
      where: { username },
      include: { project: true }
    })

    if (!worker) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Proje kontrolü
    if (worker.projectId !== projectId) {
      return NextResponse.json(
        { error: "Bu işçi bu projeye atanmamış" },
        { status: 403 }
      )
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, worker.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Hatalı şifre" },
        { status: 401 }
      )
    }

    // Bugünün tarihini al (sadece gün bazlı)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Mevcut kaydı kontrol et
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        workerId: worker.id,
        projectId,
        date: today
      }
    })

    if (existingRecord) {
      // Çıkış yap
      if (existingRecord.checkOut) {
        return NextResponse.json(
          { error: "Bugün için zaten giriş ve çıkış yaptınız" },
          { status: 400 }
        )
      }

      const checkOutTime = new Date()
      
      // Çalışma süresini hesapla (saat cinsinden)
      const checkInTime = new Date(existingRecord.checkIn!)
      const workDurationMs = checkOutTime.getTime() - checkInTime.getTime()
      const workDurationHours = workDurationMs / (1000 * 60 * 60)

      // Eğer çalışma süresi 5 saatten az ise yarım gün (0.5), değilse tam gün (1)
      const dayMultiplier = workDurationHours < 5 ? 0.5 : 1

      const updatedRecord = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: { 
          checkOut: checkOutTime,
          dayMultiplier
        }
      })

      return NextResponse.json({
        message: "Çıkış başarılı",
        record: updatedRecord,
        action: "checkOut",
        workDuration: workDurationHours.toFixed(2),
        dayMultiplier
      })
    } else {
      // Giriş yap
      const newRecord = await prisma.attendanceRecord.create({
        data: {
          workerId: worker.id,
          projectId,
          date: today,
          checkIn: new Date()
        }
      })

      return NextResponse.json({
        message: "Giriş başarılı",
        record: newRecord,
        action: "checkIn"
      })
    }
  } catch (error) {
    console.error("Worker attendance error:", error)
    return NextResponse.json(
      { error: "İşlem sırasında hata oluştu" },
      { status: 500 }
    )
  }
}