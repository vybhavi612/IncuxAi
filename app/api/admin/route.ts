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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filterDate = searchParams.get("date") || getLocalDateString(new Date())

    // 1. Basic Stats
    const totalStudents = await prisma.studentProfile.count()
    
    const todayCheckins = await prisma.attendance.findMany({
      where: { date: filterDate },
      include: {
        student: true,
        activity: true
      }
    })

    const activeTodayCount = todayCheckins.filter(a => !a.logoutTime).length
    const lateTodayCount = todayCheckins.filter(a => a.status === "LATE").length
    const submissionsCount = todayCheckins.filter(a => a.activityStatus === "SUBMITTED").length
    
    // 2. Compile Status Counts for Donut Chart
    const totalPresentRecords = await prisma.attendance.count({ where: { status: "PRESENT" } })
    const totalLateRecords = await prisma.attendance.count({ where: { status: "LATE" } })
    
    // Assuming absent count as a virtual estimation based on total students - present/late (or we can use zero for now)
    const donutChartData = [
      { name: "Present", value: totalPresentRecords, color: "#10b981" },
      { name: "Late Check-Ins", value: totalLateRecords, color: "#f59e0b" },
      { name: "Excused/Absent", value: 0, color: "#ef4444" } // Mock or estimated
    ]

    // 3. Weekly Attendance Trends (last 7 days of counts)
    const barChartData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = getLocalDateString(d)
      const count = await prisma.attendance.count({ where: { date: dateStr } })
      
      const dayLabel = d.toLocaleDateString([], { weekday: 'short' })
      barChartData.push({
        label: dayLabel,
        value: count
      })
    }

    // 4. Student Management List (All Students in DB)
    const studentsList = await prisma.studentProfile.findMany({
      include: {
        user: true,
        attendances: {
          orderBy: { date: "desc" },
          take: 5
        }
      }
    })

    return NextResponse.json({
      stats: {
        totalStudents,
        onlineToday: activeTodayCount,
        lateToday: lateTodayCount,
        submissionsToday: submissionsCount,
        checkedInToday: todayCheckins.length,
        submissionRate: todayCheckins.length > 0 ? Math.round((submissionsCount / todayCheckins.length) * 100) : 0
      },
      todayAttendance: todayCheckins,
      donutChartData,
      barChartData,
      studentsList
    })
  } catch (error: any) {
    console.error("GET admin analytics API error:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve admin dashboard analytics" }, { status: 500 })
  }
}
