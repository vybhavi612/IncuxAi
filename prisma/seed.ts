import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Default Admin User
  const adminPassword = await bcrypt.hash('Password123', 10)
  const adminEmail = 'admin@wondermakers.com'
  
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        adminProfile: {
          create: {
            name: 'Wonder Maker Admin'
          }
        }
      }
    })
    console.log('Created Admin User: admin@wondermakers.com')
  } else {
    console.log('Admin User already exists.')
  }

  // 2. Create Default Students
  const studentPassword = await bcrypt.hash('Password123', 10)
  const studentsToCreate = [
    { studentId: 'STU001', name: 'Alice Vance', batch: 'Batch A', email: 'alice@wondermakers.com' },
    { studentId: 'STU002', name: 'Bob Smith', batch: 'Batch B', email: 'bob@wondermakers.com' },
    { studentId: 'STU003', name: 'Charlie Brown', batch: 'Batch A', email: 'charlie@wondermakers.com' },
  ]

  for (const student of studentsToCreate) {
    const existingUser = await prisma.user.findUnique({
      where: { username: student.studentId }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          username: student.studentId,
          email: student.email,
          password: studentPassword,
          role: 'STUDENT',
          studentProfile: {
            create: {
              studentId: student.studentId,
              name: student.name,
              batch: student.batch,
              profilePhoto: null // Will capture on first login
            }
          }
        }
      })
      console.log(`Created Student User: ${student.studentId} (${student.name})`)
    } else {
      console.log(`Student ${student.studentId} already exists.`)
    }
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
