import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { projectId, workerName, latitude, longitude } = await req.json();
    
    const attendance = await prisma.attendanceRecord.create({
      data: { 
        projectId, 
        workerName, 
        latitude, 
        longitude,
        date: new Date(),
        checkIn: new Date()
      }
    });
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance check-in error:", error);
    return NextResponse.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}