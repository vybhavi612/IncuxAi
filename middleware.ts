import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    
    // Admin path security: only admins allowed
    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url))
    }
    
    // Student path security: only students allowed
    if (path.startsWith("/student") && token.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
  ],
}
