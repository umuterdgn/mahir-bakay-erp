/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Server Action: İletişim bilgilerini güncelle
export async function updateContactInfo(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    return { error: "Oturum bulunamadı" }
  }

  const personel = await prisma.personel.findFirst({
    where: { userId: session.user.id },
    select: { id: true }
  })

  if (!personel) {
    return { error: "Personel bulunamadı" }
  }

  const email = formData.get("email") as string
  const phone = formData.get("phone") as string

  // İletişim bilgilerini güncelle
  await prisma.personel.update({
    where: { id: personel.id },
    data: {
      email,
      phone
    }
  })

  revalidatePath("/personnel/profile")
  redirect("/personnel/profile")
}

// Server Action: Acil durum bilgilerini güncelle
export async function updateEmergencyContact(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    return { error: "Oturum bulunamadı" }
  }

  const personel = await prisma.personel.findFirst({
    where: { userId: session.user.id },
    select: { id: true }
  })

  if (!personel) {
    return { error: "Personel bulunamadı" }
  }

  const name = formData.get("name") as string
  const relation = formData.get("relation") as string
  const phone = formData.get("phone") as string

  // Acil durum bilgilerini güncelle
  await prisma.personel.update({
    where: { id: personel.id },
    data: {
      emergencyContactName: name,
      emergencyContactRelation: relation,
      emergencyContactPhone: phone
    }
  })

  revalidatePath("/personnel/profile")
  redirect("/personnel/profile")
}
