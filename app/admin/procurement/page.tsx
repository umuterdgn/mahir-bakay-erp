/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { prisma } from "@/lib/prisma";
import ProcurementClient from "./ProcurementClient";

export default async function ProcurementPage() {
  const requests = await prisma.materialRequest.findMany({
    include: {
      project: {
        select: { name: true },
      },
      requester: {
        select: { name: true, surname: true },
      },
      purchaseOrders: true,
    },
    orderBy: [
      { urgency: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <ProcurementClient initialRequests={requests} />
  );
}
