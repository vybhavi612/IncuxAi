import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Student ID or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const { username, password } = credentials

        try {
          // Check if it's admin login (email format)
          const isAdminLogin = username.includes("@")

          let user: any = null
          if (isAdminLogin) {
            // Admin authentication
            user = await prisma.user.findUnique({
              where: { email: username },
              include: { adminProfile: true },
            })

            if (!user || user.role !== "ADMIN") {
              throw new Error("Invalid admin credentials")
            }
          } else {
            // Student authentication - find student profile by studentId
            const studentProfile = await prisma.studentProfile.findUnique({
              where: { studentId: username.trim().toUpperCase() },
              include: { user: true },
            })

            if (!studentProfile) {
              throw new Error("Student ID not found")
            }

            user = studentProfile.user
            // Attach student profile to user object for session building
            ;(user as any).studentProfile = studentProfile
          }

          if (!user) {
            throw new Error("User credentials invalid")
          }

          const isValidPassword = await bcrypt.compare(password, user.password)
          if (!isValidPassword) {
            throw new Error("Invalid password")
          }

          // Return session user fields
          return {
            id: user.id,
            email: user.email,
            name: isAdminLogin ? user.adminProfile?.name : (user as any).studentProfile?.name,
            role: user.role,
            studentId: isAdminLogin ? undefined : (user as any).studentProfile?.studentId,
            batch: isAdminLogin ? undefined : (user as any).studentProfile?.batch,
            profilePhoto: isAdminLogin ? undefined : (user as any).studentProfile?.profilePhoto,
          }
        } catch (error: any) {
          console.error("Auth error details:", error)
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.studentId = user.studentId
        token.batch = user.batch
        token.profilePhoto = user.profilePhoto
      }
      
      // Handle manual session updates (like updating a new profile photo in client)
      if (trigger === "update" && session) {
        if (session.profilePhoto !== undefined) {
          token.profilePhoto = session.profilePhoto
        }
        if (session.name !== undefined) {
          token.name = session.name
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.studentId = token.studentId
        session.user.batch = token.batch
        session.user.profilePhoto = token.profilePhoto
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
