import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // Check if this is a worker or personnel
    const worker = await prisma.worker.findUnique({
      where: { id: resolvedParams.id }
    })
    
    const personel = await prisma.personel.findUnique({
      where: { id: resolvedParams.id }
    })

    let assignedInventory: any[] = []

    if (worker) {
      // For workers, use InventoryAssignment relation
      assignedInventory = await prisma.inventory.findMany({
        where: {
          assignments: {
            some: { workerId: resolvedParams.id }
          }
        },
        include: {
          project: true,
          assignments: {
            where: { workerId: resolvedParams.id },
            include: { worker: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    } else if (personel) {
      // For personnel, use StockMovement relation
      assignedInventory = await prisma.stock.findMany({
        where: {
          movements: {
            some: { personnelId: resolvedParams.id }
          }
        },
        include: {
          movements: {
            where: { personnelId: resolvedParams.id },
            orderBy: { date: "desc" }
          }
        },
        orderBy: { name: "asc" }
      })
    }

    return NextResponse.json(assignedInventory)
  } catch (error) {
    console.error("Error fetching assigned inventory:", error)
    return NextResponse.json({ error: "Failed to fetch assigned inventory" }, { status: 500 })
  }
}
