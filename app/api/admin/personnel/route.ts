import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const personnel = await prisma.personel.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(personnel)
  } catch (error) {
    console.error("Error fetching personnel:", error)
    return NextResponse.json({ error: "Failed to fetch personnel" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const personnel = await prisma.personel.create({
      data: {
        personnelNo: body.personnelNo,
        name: body.name,
        tcNo: body.tcNo || null,
        age: body.age,
        birthDate: new Date(body.birthDate),
        department: body.department,
        currentSite: body.currentSite,
        phone: body.phone || null,
        email: body.email || null,
        hireDate: new Date(body.hireDate || new Date()),
        status: "ACTIVE"
      }
    })
    
    return NextResponse.json(personnel)
  } catch (error) {
    console.error("Error creating personnel:", error)
    return NextResponse.json({ error: "Failed to create personnel" }, { status: 500 })
  }
}
