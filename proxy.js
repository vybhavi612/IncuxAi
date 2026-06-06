import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function proxy(request) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // Define protected routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname === '/'

  if (isDashboardRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verify session
    const decrypted = await decrypt(session)
    if (!decrypted) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role-based protection
    if (pathname.startsWith('/dashboard/admin') && decrypted.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url))
    }
    if (pathname.startsWith('/dashboard/student') && decrypted.user.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }
  }

  if (isAuthRoute && session) {
    const decrypted = await decrypt(session)
    if (decrypted) {
      const dashboard = decrypted.user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/student'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|bg.png).*)'],
}
