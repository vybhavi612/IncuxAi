"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "./theme-provider"
import { Sun, Moon, LogOut, Shield, User, Clock } from "lucide-react"
import Link from "next/link"

export function NavBar() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    // If student, we direct them to sign out cleanly
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full px-6 py-4 border-b border-white/5 flex items-center justify-between mb-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-950/20">
          W
        </div>
        <Link href="/" className="flex flex-col">
          <span className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            WONDER MAKERS
          </span>
          <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-mono font-semibold">
            Attendance Hub
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Session details */}
        {session?.user && (
          <div className="hidden sm:flex items-center gap-3 border-r border-white/5 pr-4">
            {/* Student profile photo if available */}
            {session.user.role === "STUDENT" ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center shrink-0">
                {session.user.profilePhoto ? (
                  <img 
                    src={session.user.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
            )}

            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-slate-200">
                {session.user.name}
              </span>
              <span className="flex items-center gap-1">
                {session.user.role === "ADMIN" ? (
                  <span className="text-[8px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                ) : (
                  <span className="text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Student ({session.user.studentId})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Logout */}
        {session && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition text-xs font-semibold cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </nav>
  )
}
