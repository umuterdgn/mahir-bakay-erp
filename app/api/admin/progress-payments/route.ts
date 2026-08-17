import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    
    const payments = await prisma.progressPayments.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching progress payments:", error);
    return NextResponse.json({ error: "Hakedişler yüklenirken hata oluştu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { projectId, subcontractor, workType, unit, quantity, unitPrice, description } = data;
    
    const totalAmount = quantity * unitPrice;

    const payment = await prisma.progressPayments.create({
      data: { 
        projectId, 
        subcontractor, 
        workType, 
        unit, 
        quantity, 
        unitPrice, 
        totalAmount, 
        description 
      },
      include: {
        project: true
      }
    });
    
    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error creating progress payment:", error);
    return NextResponse.json({ error: "Hakediş oluşturulamadı" }, { status: 500 });
  }
}