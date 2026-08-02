import { prisma } from "@/lib/prisma"
import ServicesClient from "./ServicesClient"

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

export default async function HizmetlerimizPage() {
  const services = await getServices()

  return <ServicesClient services={services} />
}