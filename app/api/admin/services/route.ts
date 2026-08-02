import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Services fetch error:", error)
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

    const service = await prisma.service.create({
      data: {
        title,
        description,
        images: images || []
      }
    })

    revalidatePath("/")
    revalidatePath("/hizmetlerimiz")

    return NextResponse.json(service)
  } catch (error) {
    console.error("Service create error:", error)
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

    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        images: images || []
      }
    })

    revalidatePath("/")
    revalidatePath("/hizmetlerimiz")

    return NextResponse.json(service)
  } catch (error) {
    console.error("Service update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}