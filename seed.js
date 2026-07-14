import { prisma } from './lib/prisma.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding sample data...')
  
  // Cleanup existing
  await prisma.attendance.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    }
  })

  // Create Student
  const student = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'student@example.com',
      passwordHash,
      role: 'STUDENT',
      studentId: 'STU-1001',
      course: 'Computer Science',
      phone: '1234567890'
    }
  })

  // Create Attendance Records
  const dates = [
    '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'
  ]

  for (const date of dates) {
    const isLate = Math.random() > 0.7
    const loginTime = new Date(`${date}T${isLate ? '10:15' : '09:45'}:00`)
    const logoutTime = new Date(`${date}T17:00:00`)
    
    await prisma.attendance.create({
      data: {
        userId: student.id,
        date,
        loginTime,
        logoutTime,
        isLate,
        lateDelayMinutes: isLate ? 15 : 0,
        totalHours: 7.25
      }
    })
  }

  console.log('Seeding complete. Credentials:')
  console.log('Admin: admin@example.com / password123')
  console.log('Student: student@example.com / password123')
}

seed()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
