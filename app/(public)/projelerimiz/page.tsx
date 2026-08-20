import { prisma } from "@/lib/prisma"
import ProjectsClient from "./ProjectsClient"

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
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

export default async function ProjelerimizPage() {
  const projects = await getProjects()

  // Sanitize null values to undefined for type compatibility
  const sanitizedProjects = projects.map(project => ({
    ...project,
    threeDModelUrl: project.threeDModelUrl ?? undefined,
    year: project.year ?? undefined,
    location: project.location ?? undefined
  }))

  return <ProjectsClient projects={sanitizedProjects} />
}