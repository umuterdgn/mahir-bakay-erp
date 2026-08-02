import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Projects fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, images } = body

    const project = await prisma.project.create({
      data: {
        title,
        description,
        images: images || []
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Project create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, images } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        images: images || []
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Project update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}