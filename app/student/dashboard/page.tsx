"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/nav-bar"
import { WebcamCapture } from "@/components/webcam-capture"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Calendar, CheckCircle2, AlertTriangle, Play, LogOut, ArrowRight, FileText, CheckCircle, RefreshCw } from "lucide-react"

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


interface TodayAttendance {
  id: string
  loginTime: string
  logoutTime: string | null
  duration: number | null
  status: "PRESENT" | "LATE" | "ABSENT"
  activityStatus: "SUBMITTED" | "NO_WORK_SUBMITTED" | "INACTIVE_SESSION"
  activity?: {
    projectTitle: string
    dailyTask: string
    progressNotes: string
    gitHubLink: string
  } | null
}

interface HistoryItem {
  id: string
  loginTime: string
  logoutTime: string | null
  duration: number | null
  status: "PRESENT" | "LATE" | "ABSENT"
  activityStatus: "SUBMITTED" | "NO_WORK_SUBMITTED" | "INACTIVE_SESSION"
  date: string
}

export default function StudentDashboard() {
  const { data: session, update: updateSession } = useSession()
  
  // Dashboard states
  const [profile, setProfile] = useState<any>(null)
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Live states
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [elapsedTime, setElapsedTime] = useState("00h 00m 00s")
  
  // Webcam Verification State
  const [showWebcam, setShowWebcam] = useState(false)
  const [webcamUploading, setWebcamUploading] = useState(false)
  
  // Form states
  const [projectTitle, setProjectTitle] = useState("")
  const [dailyTask, setDailyTask] = useState("")
  const [progressNotes, setProgressNotes] = useState("")
  const [gitHubLink, setGitHubLink] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  // Fetch student details & today's status
  const fetchDashboardData = async () => {
    try {
      setError(null)
      const res = await fetch("/api/attendance")
      if (!res.ok) {
        throw new Error("Failed to load dashboard data.")
      }
      const data = await res.json()
      setProfile(data.studentProfile)
      setTodayAttendance(data.todayAttendance)
      setHistory(data.history || [])
      
      // If student has no profile photo, force webcam capture
      if (data.studentProfile && !data.studentProfile.profilePhoto) {
        setShowWebcam(true)
      } else {
        setShowWebcam(false)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Could not retrieve records.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Live digital clock & date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Live session duration calculator
  useEffect(() => {
    if (!todayAttendance || todayAttendance.logoutTime || !todayAttendance.loginTime) {
      setElapsedTime("")
      return
    }

    const calculateElapsed = () => {
      const login = new Date(todayAttendance.loginTime).getTime()
      const now = new Date().getTime()
      const diff = now - login
      
      if (diff < 0) {
        setElapsedTime("00h 00m 00s")
        return
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)

      setElapsedTime(
        `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
      )
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 1000)
    return () => clearInterval(interval)
  }, [todayAttendance])

  // Handle webcam capture completion
  const handlePhotoCaptured = async (imageUrl: string) => {
    setWebcamUploading(true)
    try {
      // 1. Sync session photo changes
      await updateSession({ profilePhoto: imageUrl })
      
      // 2. Perform check-in call (creating today's attendance immediately on biometric save)
      const checkInRes = await fetch("/api/attendance", { method: "POST" })
      if (!checkInRes.ok) {
        throw new Error("Credentials check-in failed.")
      }
      
      setShowWebcam(false)
      fetchDashboardData()
    } catch (err: any) {
      console.error(err)
      setError("Webcam verification successful, but failed to log attendance check-in. Try manually checking in.")
    } finally {
      setWebcamUploading(false)
    }
  }

  // Handle Manual check-in (If photo is already saved but not checked in yet)
  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/attendance", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to check in.")
      }
      fetchDashboardData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Check-out / Logout
  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to clock out for the day? This will calculate your final hours.")) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/attendance/logout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to check out.")
      }
      fetchDashboardData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Project Task submission
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setError(null)
    setFormSuccess(false)

    try {
      const res = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          dailyTask,
          progressNotes,
          gitHubLink
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit daily update.")
      }

      setFormSuccess(true)
      fetchDashboardData()
      
      // Auto-clear form
      setProjectTitle("")
      setDailyTask("")
      setProgressNotes("")
      setGitHubLink("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Calculate Attendance stats based on history
  const totalDays = history.length
  const lateDays = history.filter(h => h.status === "LATE").length
  const presentDays = totalDays - lateDays
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <NavBar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative">
        {/* Verification webcam overlay */}
        <AnimatePresence>
          {showWebcam && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md"
              >
                {webcamUploading ? (
                  <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-bold text-white mb-2">Syncing Biometrics</h3>
                    <p className="text-xs text-slate-400">Verifying capture details and initializing check-in. Please wait.</p>
                  </div>
                ) : (
                  <WebcamCapture onCaptureComplete={handlePhotoCaptured} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading student environment...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Welcome, Profile & Session controller */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Profile glass-card */}
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[80px] blur-xl"></div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-white/10 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-inner">
                    {profile?.profilePhoto ? (
                      <img 
                        src={profile.profilePhoto} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-700 animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-mono tracking-wider">WELCOME</span>
                    <h2 className="text-lg font-bold text-slate-100">{profile?.name}</h2>
                    <span className="text-[10px] text-indigo-400 font-semibold">{profile?.batch} • ID: {profile?.studentId}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Present Rate</span>
                    <span className="text-lg font-bold text-white">{attendanceRate}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Active Logs</span>
                    <span className="text-lg font-bold text-white">{totalDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Time & Attendance controls */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-slate-400 text-[10px] font-semibold mb-4">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  LIVE SYSTEM TIME
                </div>

                <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono mb-1">
                  {currentTime}
                </h1>
                <p className="text-[11px] text-slate-400 mb-6 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {currentDate}
                </p>

                {/* Status indicator */}
                <div className="w-full p-4 rounded-2xl bg-slate-950/45 border border-white/5 mb-6 flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">TODAY'S SHIFT STATUS</span>
                  
                  {todayAttendance ? (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        {todayAttendance.status === "PRESENT" ? (
                          <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Late Check-In
                          </span>
                        )}

                        {todayAttendance.logoutTime && (
                          <span className="text-xs bg-slate-800/70 border border-white/5 text-slate-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Shift Ended
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-col items-center">
                        {todayAttendance.logoutTime ? (
                          <>
                            <span className="text-sm font-semibold text-slate-400">Total Clocked Time</span>
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-mono mt-0.5">
                              {todayAttendance.duration} hrs
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-slate-500">Live Duration Counter</span>
                            <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 animate-pulse">
                              {elapsedTime}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 mt-2 font-medium">No check-in record found for today.</span>
                  )}
                </div>

                {/* Clock-in / Clock-out Action Buttons */}
                {!todayAttendance ? (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Clock In Session
                  </button>
                ) : !todayAttendance.logoutTime ? (
                  <button
                    onClick={handleCheckOut}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20"
                  >
                    <LogOut className="w-4 h-4" />
                    End Session (Clock Out)
                  </button>
                ) : (
                  <div className="w-full py-3 bg-slate-900 border border-white/5 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed">
                    Daily Shift Completed
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Project activity input & Daily history logs */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Error messages if any */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Project Activity Submission Section */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-200">Daily Project Activity</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Submit your development progress for monitoring</p>
                  </div>
                  {todayAttendance?.activityStatus === "SUBMITTED" ? (
                    <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Submitted
                    </span>
                  ) : todayAttendance ? (
                    <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Action Pending
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Unavailable
                    </span>
                  )}
                </div>

                {todayAttendance?.activityStatus === "SUBMITTED" ? (
                  // Activity submitted success state
                  <div className="bg-emerald-950/20 border border-emerald-500/10 p-5 rounded-2xl text-left">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Today's Submission Details</h4>
                    <div className="mt-4 flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">PROJECT TITLE</span>
                        <span className="text-sm font-semibold text-slate-200">{todayAttendance.activity?.projectTitle}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">DAILY TASKS & OBJECTIVES</span>
                        <span className="text-xs text-slate-300 whitespace-pre-line">{todayAttendance.activity?.dailyTask}</span>
                      </div>
                      {todayAttendance.activity?.progressNotes && (
                        <div>
                          <span className="text-[10px] text-slate-500 block">PROGRESS NOTES</span>
                          <span className="text-xs text-slate-400">{todayAttendance.activity?.progressNotes}</span>
                        </div>
                      )}
                      {todayAttendance.activity?.gitHubLink && (
                        <div className="mt-2">
                          <a 
                            href={todayAttendance.activity.gitHubLink}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            <Github className="w-3.5 h-3.5" />
                            View GitHub Code Base
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : todayAttendance && !todayAttendance.logoutTime ? (
                  // Active form input
                  <form onSubmit={handleActivitySubmit} className="flex flex-col gap-4">
                    {formSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Daily project report uploaded successfully. Status locked.</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Project Title</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Client Billing Dashboard"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          className="glass-input px-4 py-2.5 rounded-xl text-xs"
                          disabled={formSubmitting}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">GitHub Repository Link</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                            <Github className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="url"
                            placeholder="E.g., https://github.com/..."
                            value={gitHubLink}
                            onChange={(e) => setGitHubLink(e.target.value)}
                            className="glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs w-full"
                            disabled={formSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Daily Tasks Executed</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="- Hooked up login validations&#10;- Integrated Prisma schema migrations&#10;- Configured webcam permission handlers"
                        value={dailyTask}
                        onChange={(e) => setDailyTask(e.target.value)}
                        className="glass-input px-4 py-2.5 rounded-xl text-xs resize-none"
                        disabled={formSubmitting}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Progress Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="E.g., Slow build times encountered on React 19 package bundles"
                        value={progressNotes}
                        onChange={(e) => setProgressNotes(e.target.value)}
                        className="glass-input px-4 py-2.5 rounded-xl text-xs"
                        disabled={formSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="mt-2 self-end px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {formSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Uploading report...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submit Work Log
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  // Disabled view if checked out or not checked in
                  <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2 border border-dashed border-white/5 rounded-2xl bg-white/2">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-medium">Check-in session is required to open daily reports.</p>
                  </div>
                )}
              </div>

              {/* Attendance Log History */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Historical Attendance Timeline</h3>
                
                {history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-3 px-4 font-semibold text-slate-400">Date</th>
                          <th className="py-3 px-4 font-semibold text-slate-400">Check-In</th>
                          <th className="py-3 px-4 font-semibold text-slate-400">Check-Out</th>
                          <th className="py-3 px-4 font-semibold text-slate-400">Duration</th>
                          <th className="py-3 px-4 font-semibold text-slate-400">Time Status</th>
                          <th className="py-3 px-4 font-semibold text-slate-400">Report Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((log) => (
                          <tr key={log.id} className="border-b border-white/3 hover:bg-white/2 transition">
                            <td className="py-3.5 px-4 font-medium text-slate-200">{log.date}</td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {log.logoutTime 
                                ? new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "—"
                              }
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                              {log.duration !== null ? `${log.duration} hrs` : "Running"}
                            </td>
                            <td className="py-3.5 px-4">
                              {log.status === "PRESENT" ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[9px]">
                                  Present
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase text-[9px]">
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
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[9px]">
                                  No Work
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl">
                    No historic attendance records registered.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  )
}
