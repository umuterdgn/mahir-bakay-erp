import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
        assignedItems: {
          include: {
            project: true
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
    const resolvedParams = await params
    const body = await request.json()
    
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
    const resolvedParams = await params
    await prisma.personel.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting personnel:", error)
    return NextResponse.json({ error: "Failed to delete personnel" }, { status: 500 })
  }
}
