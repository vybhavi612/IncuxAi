"use client"

import React, { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student")
  const [username, setUsername] = useState("") // studentId or email
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user.role === "ADMIN") {
        router.replace("/admin/dashboard")
      } else {
        router.replace("/student/dashboard")
      }
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!username || !password) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    // Format username check for admin (requires @)
    if (activeTab === "admin" && !username.includes("@")) {
      setError("Please enter a valid email address for Admin login.")
      setIsLoading(false)
      return
    }

    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false
      })

      if (res?.error) {
        // Humanize common errors
        if (res.error.includes("password") || res.error.includes("invalid")) {
          setError("Invalid username or password. Please try again.")
        } else if (res.error.includes("timeout") || res.error.includes("connection")) {
          setError("The authentication server is currently unreachable. Please check your connection or try again later.")
        } else {
          setError(res.error)
        }
      } else {
        // Redirection handled by useEffect, but add a fallback router push
        router.refresh()
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear fields on tab change
  const handleTabChange = (tab: "student" | "admin") => {
    setActiveTab(tab)
    setUsername("")
    setPassword("")
    setError(null)
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Entering security gateway...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating blurred background elements */}
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-emerald-600/10 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo and Titles */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xl shadow-indigo-950/30">
            W
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              WONDER MAKERS
            </h1>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-semibold">
              Attendance & Activity Tracking
            </span>
          </div>
        </div>

        {/* Login glass card */}
        <div className="glass-panel w-full rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden mt-6">
          {/* Top tab switcher */}
          <div className="flex p-1.5 bg-slate-950/40 border border-white/5 rounded-2xl mb-8 relative">
            <button
              onClick={() => handleTabChange("student")}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 cursor-pointer ${
                activeTab === "student" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student Portal
            </button>
            <button
              onClick={() => handleTabChange("admin")}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 cursor-pointer ${
                activeTab === "admin" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </button>

            {/* Sliding backdrop indicator */}
            <motion.div
              layoutId="loginTabBackdrop"
              className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-xl"
              style={{ originY: "0px" }}
              animate={{
                x: activeTab === "student" ? 0 : "100%"
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Header within card */}
            <div>
              <h2 className="text-lg font-bold text-slate-200">
                {activeTab === "student" ? "Welcome back, student" : "Administrator Sign In"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "student" 
                  ? "Enter your Student ID and Password to capture your log" 
                  : "Enter your corporate credentials to manage dashboard records"
                }
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl text-rose-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ID / Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold px-1">
                {activeTab === "student" ? "Student ID" : "Corporate Email"}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  {activeTab === "student" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </div>
                <input
                  type={activeTab === "student" ? "text" : "email"}
                  placeholder={activeTab === "student" ? "STU001" : "admin@wondermakers.com"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  disabled={isLoading}
                  autoComplete={activeTab === "student" ? "username" : "email"}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-11 pr-10 py-3 rounded-xl text-sm"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-950/25 transition duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying Credentials...
                </>
              ) : (
                activeTab === "student" ? "Clock In & Login" : "Access Console"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-600 text-center mt-8 font-mono">
          SECURE PROTOCOL • VERSION 2.0.26
        </p>
      </div>
    </main>
  )
}
