import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

// Doğrudan bağlantı adresini (Hardcoded Fallback) tanımlıyoruz
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_K4iMd0SvNtQZ@ep-bold-dew-ag5mbbwd.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

// globalThis hafızasını (cache zehirlenmesi yaptığı için) tamamen sildik.
// Her seferinde tertemiz bir Adapter oluşturulacak.
const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })