import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password, role, phone, studentId, course } = await req.json()
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (role === 'STUDENT' && (!studentId || !course)) {
      return NextResponse.json({ error: 'Student ID and Course are required for students' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        passwordHash, 
        role, 
        phone, 
        studentId: role === 'STUDENT' ? studentId : null, 
        course: role === 'STUDENT' ? course : null 
      }
    })
    return NextResponse.json({ message: 'User created successfully', user: { id: user.id } })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
