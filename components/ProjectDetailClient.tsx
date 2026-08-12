"use client"

import ProjectEditForm from "@/components/ProjectEditForm"

interface ProjectDetailClientProps {
  project: any
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const handleProjectUpdated = () => {
    // Refresh the page to show updated data
    window.location.reload()
  }

  return <ProjectEditForm project={project} onProjectUpdated={handleProjectUpdated} />
}
