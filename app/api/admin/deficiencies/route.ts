/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const deficiencies = await prisma.deficiency.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            yibfNo: true
          }
        },
        inspector: {
          select: {
            id: true,
            name: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true
          }
        },
        inspection: {
          select: {
            id: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(deficiencies)
  } catch (error) {
    console.error("Failed to fetch deficiencies:", error)
    return NextResponse.json([])
  }
}
