import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, permissions } = body

    const updateData: any = {
      name,
      email,
      role
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Delete existing permissions
    await prisma.permission.deleteMany({
      where: { userId: params.id }
    })

    // Update user and create new permissions
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...updateData,
        permissions: {
          create: permissions || []
        }
      },
      include: {
        permissions: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}