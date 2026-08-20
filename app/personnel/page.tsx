/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PersonnelPortal } from "./components/PersonnelPortal"

export default async function PersonnelPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const userRole = session.user?.role as string
  const isPersonnel = userRole === "STAFF" || userRole === "WORKER"

  if (!isPersonnel) {
    redirect("/admin")
  }

  // Fetch personnel data
  const personnel = await (prisma as any).personel.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      attendanceRecords: {
        include: {
          project: true
        },
        orderBy: { date: 'desc' },
        take: 7
      },
      inventoryAssignments: {
        include: {
          inventory: true
        },
        where: {
          returnedAt: null
        }
      },
      payments: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  })

  if (!personnel) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Personel kaydı bulunamadı</div>
      </div>
    )
  }

  // Fetch tasks for this personnel
  const tasks = await (prisma as any).task.findMany({
    where: {
      assignedToId: personnel.id
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Calculate summary data
  const thisMonthAttendance = personnel.attendanceRecords.filter((record: any) => {
    const recordDate = new Date(record.date)
    const now = new Date()
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
  })

  const totalDayMultiplier = thisMonthAttendance.reduce((sum: number, record: any) => sum + (record.dayMultiplier || 0), 0)
  const estimatedEarnings = totalDayMultiplier * (personnel.gunlukYevmiye || 0)
  const totalHours = thisMonthAttendance.reduce((sum: number, record: any) => {
    if (record.checkIn && record.checkOut) {
      const hours = (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)
      return sum + hours
    }
    return sum
  }, 0)

  const portalData = {
    personnel: {
      id: personnel.id,
      name: personnel.name,
      department: personnel.department,
      currentSite: personnel.currentSite
    },
    summary: {
      estimatedEarnings,
      totalHours: Math.round(totalHours * 10) / 10,
      attendanceCount: thisMonthAttendance.length,
      equipmentCount: personnel.inventoryAssignments.length
    },
    attendanceRecords: personnel.attendanceRecords,
    equipment: personnel.inventoryAssignments,
    tasks: tasks,
    payments: personnel.payments
  }

  return <PersonnelPortal data={portalData} />
}
