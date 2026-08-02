import { DefaultSession } from "next-auth"
import { UserRole, Permission } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      permissions: Permission[]
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    permissions: Permission[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    permissions: Permission[]
  }
}