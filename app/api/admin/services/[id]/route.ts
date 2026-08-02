import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.service.delete({
      where: { id }
    })

    revalidatePath("/")
    revalidatePath("/hizmetlerimiz")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Service delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
