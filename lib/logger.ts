import { prisma } from "@/lib/prisma"

export async function logAction(action: string, details: string, user: string = "Sistem/Admin") {
  try {
    await prisma.systemLog.create({
      data: { action, details, user }
    })
  } catch (error) {
    console.error("Log yazılamadı:", error)
  }
}
