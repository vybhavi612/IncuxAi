import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/auth'
import { differenceInMinutes, format } from 'date-fns'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

    await createSession({ id: user.id, role: user.role, name: user.name })

    let lateDelayMinutes = 0
    let isLate = false
    let attendance = null

    if (user.role === 'STUDENT') {
      const todayString = format(new Date(), 'yyyy-MM-dd')
      const now = new Date()
      
      const expectedTime = new Date()
      expectedTime.setHours(10, 0, 0, 0)

      const diff = differenceInMinutes(now, expectedTime)
      if (diff > 0) {
        isLate = true
        lateDelayMinutes = diff
      }

      const existingRecord = await prisma.attendance.findUnique({
        where: { userId_date: { userId: user.id, date: todayString } }
      })

      if (!existingRecord) {
        attendance = await prisma.attendance.create({
          data: {
            userId: user.id,
            date: todayString,
            loginTime: now,
            isLate,
            lateDelayMinutes
          }
        })
      } else {
        attendance = existingRecord
      }
    }

    return NextResponse.json({ 
      user: { id: user.id, role: user.role, name: user.name },
      attendance,
      isLate,
      lateDelayMinutes
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
