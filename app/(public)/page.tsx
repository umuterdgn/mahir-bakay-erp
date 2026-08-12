import { prisma } from "@/lib/prisma"
import HomeClient from "./HomeClient"

async function getFeaturedServices() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        threeDModelUrl: true
      }
    })
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

async function getFeaturedProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        year: true,
        location: true,
        threeDModelUrl: true
      }
    })
    return projects
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export default async function Home() {
  const featuredServices = await getFeaturedServices()
  const featuredProjects = await getFeaturedProjects()

  return <HomeClient featuredServices={featuredServices} featuredProjects={featuredProjects} />
}