import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logPersonnelAction } from "@/lib/logger"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const person = await prisma.personel.findUnique({
      where: { id: resolvedParams.id },
      include: {
        payments: {
          orderBy: { date: "desc" }
        },
        inventoryHistory: {
          include: {
            inventory: true
          }
        }
      }
    })
    
    if (!person) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }
    
    return NextResponse.json(person)
  } catch (error) {
    console.error("Error fetching personnel:", error)
    return NextResponse.json({ error: "Failed to fetch personnel" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userName = session?.user?.name || "Bilinmeyen Kullanıcı"
    
    const resolvedParams = await params
    const body = await request.json()
    
    // Get the existing personnel to log the name
    const existingPerson = await prisma.personel.findUnique({
      where: { id: resolvedParams.id }
    })
    
    const updatedPerson = await prisma.personel.update({
      where: { id: resolvedParams.id },
      data: {
        ...body,
        age: body.age ? Number(body.age) : undefined,
        salary: body.salary ? parseFloat(body.salary.toString()) : 0,
        salaryPayDay: body.salaryPayDay ? Number(body.salaryPayDay) : null,
        sgkPeriod: body.sgkPeriod || null,
        sgkPayDay: body.sgkPayDay ? Number(body.sgkPayDay) : null,
        healthStatus: body.healthStatus || null,
        bonuses: body.bonuses ? parseFloat(body.bonuses.toString()) : 0
      }
    })
    
    // Log the action with detailed information
    if (existingPerson) {
      await logPersonnelAction("GUNCELLENDI", userName, existingPerson.name, `Personel No: ${existingPerson.personnelNo}`)
    }
    
    return NextResponse.json(updatedPerson)
  } catch (error) {
    console.error("Error updating personnel:", error)
    return NextResponse.json({ error: "Failed to update personnel" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userName = session?.user?.name || "Bilinmeyen Kullanıcı"
    
    const resolvedParams = await params
    
    // Get the existing personnel to log the name
    const existingPerson = await prisma.personel.findUnique({
      where: { id: resolvedParams.id }
    })
    
    await prisma.personel.delete({
      where: { id: resolvedParams.id }
    })
    
    // Log the action with detailed information
    if (existingPerson) {
      await logPersonnelAction("SILINDI", userName, existingPerson.name, `Personel No: ${existingPerson.personnelNo}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting personnel:", error)
    return NextResponse.json({ error: "Failed to delete personnel" }, { status: 500 })
  }
}
