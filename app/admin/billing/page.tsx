/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { prisma } from "@/lib/prisma"
import BillingClient from "./BillingClient"

export default async function AdminBillingPage() {
  const billings = await prisma.progressBilling.findMany({
    include: {
      project: {
        select: { name: true }
      },
      subcontractor: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const subcontractors = await prisma.company.findMany({
    where: { type: "SUBCONTRACTOR" },
    select: { id: true, name: true }
  })

  const projects = await prisma.project.findMany({
    where: { isActive: true },
    select: { id: true, name: true, contractValue: true }
  })

  return (
    <BillingClient 
      initialBillings={billings} 
      subcontractors={subcontractors} 
      projects={projects} 
    />
  )
}
