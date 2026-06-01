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

    const { projectTitle, dailyTask, progressNotes, gitHubLink } = await req.json()
    
    if (!projectTitle || !dailyTask) {
      return NextResponse.json({ error: "Project Title and Daily Task are required fields." }, { status: 400 })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const todayStr = getLocalDateString(new Date())

    // Check if student has checked in today
    const attendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: studentProfile.id,
          date: todayStr
        }
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: "No attendance session found for today. You must check-in before submitting daily work." }, { status: 400 })
    }

    // Create or update the activity
    const activity = await prisma.activity.upsert({
      where: {
        attendanceId: attendance.id
      },
      update: {
        projectTitle,
        dailyTask,
        progressNotes: progressNotes || "",
        gitHubLink: gitHubLink || "",
        date: todayStr
      },
      create: {
        studentId: studentProfile.id,
        attendanceId: attendance.id,
        projectTitle,
        dailyTask,
        progressNotes: progressNotes || "",
        gitHubLink: gitHubLink || "",
        date: todayStr
      }
    })

    // Update attendance activity status
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        activityStatus: "SUBMITTED"
      }
    })

    return NextResponse.json({
      success: true,
      activity,
      attendance: updatedAttendance
    })
  } catch (error: any) {
    console.error("POST activity API error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit project activity" }, { status: 500 })
  }
}
