import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "STUDENT" | "ADMIN"
      studentId?: string
      batch?: string
      profilePhoto?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "STUDENT" | "ADMIN"
    studentId?: string
    batch?: string
    profilePhoto?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "ADMIN"
    studentId?: string
    batch?: string
    profilePhoto?: string | null
  }
}
