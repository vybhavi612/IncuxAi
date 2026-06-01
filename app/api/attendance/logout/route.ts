import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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

    // Find today's attendance record
    const attendance = await prisma.attendance.findUnique({
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

    if (!attendance) {
      return NextResponse.json({ error: "No active attendance record found for today. Please check-in first." }, { status: 400 })
    }

    if (attendance.logoutTime) {
      return NextResponse.json({ 
        message: "Already logged out today", 
        attendance 
      })
    }

    // Calculate duration in hours
    const loginTime = new Date(attendance.loginTime)
    const logoutTime = now
    const durationMs = logoutTime.getTime() - loginTime.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)
    const roundedDuration = Math.round(durationHours * 100) / 100 // round to 2 decimal places

    // If no work was submitted, set activityStatus to INACTIVE_SESSION
    let activityStatus = attendance.activityStatus
    if (activityStatus === "NO_WORK_SUBMITTED" && !attendance.activity) {
      activityStatus = "INACTIVE_SESSION"
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        logoutTime,
        duration: roundedDuration,
        activityStatus
      }
    })

    return NextResponse.json({
      message: "Check-out successful",
      attendance: updatedAttendance
    })
  } catch (error: any) {
    console.error("POST logout API error:", error)
    return NextResponse.json({ error: error.message || "Failed to check out" }, { status: 500 })
  }
}
