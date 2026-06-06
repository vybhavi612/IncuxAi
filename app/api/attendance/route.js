import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth'

export async function GET(req) {
  try {
    const session = await checkAuth()
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const attendances = await prisma.attendance.findMany({
      where: { userId: session.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendances)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
