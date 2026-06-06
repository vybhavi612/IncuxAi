import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth'

export async function GET(req) {
  try {
    const session = await checkAuth()
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        attendances: {
          orderBy: { date: 'desc' }
        }
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
