import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// Get YYYY-MM-DD formatted date in local time
function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const todayStr = getLocalDateString(new Date())

    const todayAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: studentProfile.id,
          date: todayStr
        }
      },
      include: {
        activity: true
      }
    })

    // Also fetch recent attendance history (last 10 records)
    const history = await prisma.attendance.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { loginTime: "desc" },
      take: 10,
      include: {
        activity: true
      }
    })

    return NextResponse.json({ 
      todayAttendance, 
      history, 
      studentProfile 
    })
  } catch (error: any) {
    console.error("GET attendance API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch attendance data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const now = new Date()
    const todayStr = getLocalDateString(now)

    // Check if student has already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: studentProfile.id,
          date: todayStr
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({ 
        message: "Already checked in today", 
        attendance: existingAttendance 
      })
    }

    // Determine if attendance is late (Class starts at 10:00 AM)
    const loginHour = now.getHours()
    const loginMinute = now.getMinutes()
    const isLate = loginHour > 10 || (loginHour === 10 && loginMinute > 0)
    const status = isLate ? "LATE" : "PRESENT"

    const newAttendance = await prisma.attendance.create({
      data: {
        studentId: studentProfile.id,
        loginTime: now,
        date: todayStr,
        status: status,
        activityStatus: "NO_WORK_SUBMITTED"
      }
    })

    return NextResponse.json({ 
      message: "Check-in successful", 
      attendance: newAttendance 
    })
  } catch (error: any) {
    console.error("POST attendance API error:", error)
    return NextResponse.json({ error: error.message || "Failed to check in" }, { status: 500 })
  }
}
