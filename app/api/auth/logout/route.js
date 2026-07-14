import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { checkAuth, deleteSession } from '@/lib/auth'
import { differenceInMinutes, format } from 'date-fns'

export async function POST(req) {
  try {
    const session = await checkAuth()
    
    if (session?.role === 'STUDENT') {
      const todayString = format(new Date(), 'yyyy-MM-dd')
      const existingRecord = await prisma.attendance.findUnique({
        where: { userId_date: { userId: session.id, date: todayString } }
      })

      if (existingRecord) {
        const now = new Date()
        const totalMinutes = differenceInMinutes(now, existingRecord.loginTime)
        const totalHours = Number((totalMinutes / 60).toFixed(2))

        await prisma.attendance.update({
          where: { id: existingRecord.id },
          data: {
            logoutTime: now,
            totalHours
          }
        })
      }
    }

    await deleteSession()
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
