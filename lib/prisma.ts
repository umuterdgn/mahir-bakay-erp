import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Eğer Node.js 22 native WebSocket'i varsa onu kullan (bufferUtil hatasını engeller), yoksa ws paketini kullan.
neonConfig.webSocketConstructor = typeof globalThis.WebSocket !== 'undefined' ? globalThis.WebSocket : ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? (() => {
  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_K4iMd0SvNtQZ@ep-bold-dew-ag5mbbwd.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma