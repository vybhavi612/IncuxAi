"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/nav-bar"
import { PremiumBarChart, PremiumDonutChart } from "@/components/premium-charts"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCheck, AlertTriangle, FileSpreadsheet, Search, Filter, Calendar, ExternalLink, Eye, CheckCircle2, ChevronRight, X, RefreshCw } from "lucide-react"

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)


interface Student {
  id: string
  name: string
  studentId: string
  batch: string
  profilePhoto: string | null
}

interface Activity {
  id: string
  projectTitle: string
  dailyTask: string
  progressNotes: string
  gitHubLink: string
}

interface AttendanceLog {
  id: string
  loginTime: string
  logoutTime: string | null
  duration: number | null
  status: "PRESENT" | "LATE" | "ABSENT"
  activityStatus: "SUBMITTED" | "NO_WORK_SUBMITTED" | "INACTIVE_SESSION"
  date: string
  student: Student
  activity?: Activity | null
}

export default function AdminDashboard() {
  const { data: session } = useSession()

  // Dashboard states
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    onlineToday: 0,
    lateToday: 0,
    submissionsToday: 0,
    submissionRate: 0
  })
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [donutChartData, setDonutChartData] = useState<any[]>([])
  const [barChartData, setBarChartData] = useState<any[]>([])
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [selectedActivity, setSelectedActivity] = useState<string>("ALL")
  const [selectedDate, setSelectedDate] = useState("")

  // Modal detail states
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null)

  // Initialize date filter to today
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    setSelectedDate(`${year}-${month}-${day}`)
  }, [])

  // Fetch admin telemetry
  const fetchTelemetry = async () => {
    if (!selectedDate) return
    setIsLoading(true)
    try {
      setError(null)
      const res = await fetch(`/api/admin?date=${selectedDate}`)
      if (!res.ok) {
        throw new Error("Failed to load administration reports.")
      }
      const data = await res.json()
      setStats(data.stats)
      setAttendanceLogs(data.todayAttendance || [])
      setDonutChartData(data.donutChartData || [])
      setBarChartData(data.barChartData || [])
      setStudentsList(data.studentsList || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load dashboard data.")
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when date filter changes
  useEffect(() => {
    fetchTelemetry()
  }, [selectedDate])

  // Filter logs locally based on search query, status, and activity status
  const filteredLogs = attendanceLogs.filter((log) => {
    const matchesSearch = 
      log.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      selectedStatus === "ALL" || 
      log.status === selectedStatus

    const matchesActivity = 
      selectedActivity === "ALL" || 
      log.activityStatus === selectedActivity

    return matchesSearch && matchesStatus && matchesActivity
  })

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return

    const headers = ["Student Name", "Student ID", "Batch", "Login Time", "Logout Time", "Duration (hrs)", "Time Status", "Activity Status", "Project Title", "Tasks Completed", "GitHub Link"]
    
    const rows = filteredLogs.map(log => [
      log.student.name,
      log.student.studentId,
      log.student.batch,
      log.loginTime ? new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
      log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
      log.duration !== null ? log.duration : "Running",
      log.status,
      log.activityStatus,
      log.activity?.projectTitle || "—",
      log.activity?.dailyTask.replace(/\n/g, " | ") || "—",
      log.activity?.gitHubLink || "—"
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_report_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <NavBar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative">
        {/* Verification pop-up dialog */}
        <AnimatePresence>
          {selectedLog && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLog(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedLog(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-white/10 flex items-center justify-center relative shadow-inner shrink-0">
                    {selectedLog.student.profilePhoto ? (
                      <img 
                        src={selectedLog.student.profilePhoto} 
                        alt={selectedLog.student.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] text-indigo-400 font-mono tracking-widest uppercase font-semibold">{selectedLog.student.batch}</span>
                    <h3 className="text-base font-bold text-slate-100">{selectedLog.student.name}</h3>
                    <span className="text-xs text-slate-400">Student ID: {selectedLog.student.studentId}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 pb-2 border-b border-white/5">
                  Daily Project Work Log
                </h4>

                {selectedLog.activityStatus === "SUBMITTED" && selectedLog.activity ? (
                  <div className="flex flex-col gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">PROJECT TITLE</span>
                      <span className="text-sm font-semibold text-slate-200">{selectedLog.activity.projectTitle}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">TASKS & STEPS RESOLVED</span>
                      <p className="text-slate-300 bg-slate-950/40 border border-white/3 p-3 rounded-xl whitespace-pre-line leading-relaxed font-mono">
                        {selectedLog.activity.dailyTask}
                      </p>
                    </div>
                    {selectedLog.activity.progressNotes && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">PROGRESS NOTES</span>
                        <p className="text-slate-400">{selectedLog.activity.progressNotes}</p>
                      </div>
                    )}
                    {selectedLog.activity.gitHubLink && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <a 
                          href={selectedLog.activity.gitHubLink}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          <Github className="w-4 h-4" />
                          Inspect GitHub Repository
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2 border border-dashed border-white/5 rounded-2xl bg-white/2">
                    <AlertTriangle className="w-6 h-6 text-slate-600" />
                    <p className="text-xs font-medium">
                      {selectedLog.activityStatus === "INACTIVE_SESSION" 
                        ? "Student logged out without submitting work logs." 
                        : "No development activity submitted for today's session."
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. STATISTICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-indigo-400 bg-indigo-500/10 p-2 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Total Students</span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{stats.totalStudents}</h2>
            <p className="text-[9px] text-slate-500 mt-1 font-mono">Registered in Database</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Online Session</span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{stats.onlineToday}</h2>
            <p className="text-[9px] text-slate-500 mt-1 font-mono">Active checked-in users</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-amber-400 bg-amber-500/10 p-2 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Late Arrivals</span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{stats.lateToday}</h2>
            <p className="text-[9px] text-slate-500 mt-1 font-mono">Clock-ins after 10:00 AM</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-purple-400 bg-purple-500/10 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Submission Rate</span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{stats.submissionRate}%</h2>
            <p className="text-[9px] text-slate-500 mt-1 font-mono">Work log reports uploaded</p>
          </div>
        </div>

        {/* 2. ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {barChartData.length > 0 ? (
              <PremiumBarChart 
                data={barChartData} 
                title="Weekly Attendance Frequency"
                subtitle="Check-in occurrences over the last 7 calendar days"
                yLabel="Students"
                maxVal={Math.max(stats.totalStudents, 5)}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-6 h-full min-h-[220px] flex items-center justify-center text-slate-500 text-xs">
                Analyzing check-in vectors...
              </div>
            )}
          </div>
          <div className="md:col-span-1">
            {donutChartData.length > 0 ? (
              <PremiumDonutChart 
                data={donutChartData} 
                title="Cumulative Session Status"
                subtitle="Aggregate splits across all history logs"
              />
            ) : (
              <div className="glass-panel rounded-2xl p-6 h-full min-h-[220px] flex items-center justify-center text-slate-500 text-xs">
                Collating historical indexes...
              </div>
            )}
          </div>
        </div>

        {/* 3. LOG SEARCH, DATE PICKER & DATA TABLE PANEL */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5">
          <div className="flex flex-col gap-6 mb-6">
            {/* Header controls row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Daily Telemetry Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time attendance logs, logout timestamps and code submissions</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Date Selection */}
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="glass-input pl-10 pr-3 py-2 rounded-xl text-xs"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
                {/* CSV Download */}
                <button
                  onClick={exportToCSV}
                  disabled={filteredLogs.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/35 border border-indigo-500/30 text-indigo-200 text-xs font-semibold rounded-xl hover:bg-indigo-600/50 cursor-pointer disabled:opacity-50 transition"
                  title="Export filtered records to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-9 pr-4 py-2 rounded-xl text-xs w-full"
                />
              </div>

              {/* Status Select Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs w-full bg-slate-950/80"
                >
                  <option value="ALL">All Attendance Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late Check-Ins</option>
                </select>
              </div>

              {/* Work log submissions Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs w-full bg-slate-950/80"
                >
                  <option value="ALL">All Report Statuses</option>
                  <option value="SUBMITTED">Work Logs Submitted</option>
                  <option value="NO_WORK_SUBMITTED">Work Logs Missing</option>
                  <option value="INACTIVE_SESSION">Inactive Sessions</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN ATTENDANCE DATA TABLE */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500">Querying telemetry databases...</span>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-4 font-semibold text-slate-400">Photo</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Student ID</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Name</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Batch</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Login Time</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Logout Time</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Duration</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Time Status</th>
                    <th className="py-3 px-4 font-semibold text-slate-400">Report Status</th>
                    <th className="py-3 px-4 font-semibold text-slate-400 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/3 hover:bg-white/2 transition">
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center shadow-inner shrink-0">
                          {log.student.profilePhoto ? (
                            <img 
                              src={log.student.profilePhoto} 
                              alt={log.student.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-300">{log.student.studentId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{log.student.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{log.student.batch}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {log.logoutTime 
                          ? new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : <span className="text-emerald-400 font-medium tracking-wide">Active</span>
                        }
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                        {log.duration !== null ? `${log.duration} hrs` : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.status === "PRESENT" ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[9px] tracking-wide">
                            Present
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase text-[9px] tracking-wide">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.activityStatus === "SUBMITTED" ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px]">
                            Submitted
                          </span>
                        ) : log.activityStatus === "INACTIVE_SESSION" ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold text-[9px]">
                            Inactive
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 font-bold text-[9px]">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Log
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6 text-slate-600" />
              <p className="text-xs font-semibold">No attendance or activity telemetry found matching the criteria.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
