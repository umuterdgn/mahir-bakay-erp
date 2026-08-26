/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RequestsClient from "./RequestsClient";

export default async function PersonnelRequestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Oturum bulunamadı</div>;
  }

  // Get the personel record for the current user
  const personel = await prisma.personel.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!personel) {
    return <div>Personel kaydı bulunamadı</div>;
  }

  // Get user's requests
  const requests = await prisma.materialRequest.findMany({
    where: {
      requesterId: personel.id,
    },
    include: {
      project: {
        select: { name: true },
      },
      purchaseOrders: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get available projects
  const projects = await prisma.project.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <RequestsClient 
      initialRequests={requests}
      projects={projects}
      personelId={personel.id}
    />
  );
}
