"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Clock, CalendarCheck, AlertCircle, ChevronRight, User } from 'lucide-react'
import { format } from 'date-fns'

export default function StudentDashboard() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch profile and attendance
    Promise.all([
      fetch('/api/auth/profile').then(res => res.json()),
      fetch('/api/attendance').then(res => res.json())
    ]).then(([userData, attendanceData]) => {
      if (userData.error || attendanceData.error) {
         router.push('/')
      } else {
        setUser(userData)
        setRecords(attendanceData)
      }
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-brand-bg">
      <div className="relative">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  )
  
  if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>

  const todayRecord = records.find(r => r.date === format(new Date(), 'yyyy-MM-dd'))
  const totalDays = records.length
  const lateDays = records.filter(r => r.isLate).length
  const pct = totalDays > 0 ? Math.round(((totalDays - lateDays) / totalDays) * 100) : 0

  return (
    <div className="min-h-screen bg-brand-bg pb-12">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <CalendarCheck size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">AttendancePro</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.course}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
                <User size={20} />
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all font-medium"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/20">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">Hello, {user?.name.split(' ')[0]}! 👋</h2>
            <p className="mt-2 text-blue-100 max-w-md">Your attendance is automatically recorded based on your portal activity. Here's your status for today.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
        </div>

        {/* Today's Alert */}
        {todayRecord?.isLate && (
           <div className="glass-panel !border-amber-200 !bg-amber-50/50 p-6 flex items-start gap-4 animate-in slide-in-from-top-4">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
               <AlertCircle size={24} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-amber-900">Late Arrival Logged</h3>
               <p className="text-amber-800/80 mt-1">
                 You signed in {todayRecord.lateDelayMinutes} minutes past the 10:00 AM threshold. 
                 Current status: <span className="font-bold">LATE</span>
               </p>
             </div>
           </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 hover:-translate-y-1">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <CalendarCheck size={24} />
               </div>
               <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Total</span>
             </div>
             <p className="text-slate-500 font-medium">Days Present</p>
             <div className="flex items-baseline gap-2 mt-1">
               <p className="text-4xl font-black text-slate-900">{totalDays}</p>
               <p className="text-slate-400 text-sm">active days</p>
             </div>
          </div>

          <div className="glass-panel p-8 hover:-translate-y-1">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                 <Clock size={24} />
               </div>
               <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Accuracy</span>
             </div>
             <p className="text-slate-500 font-medium">On-Time Rate</p>
             <div className="flex items-baseline gap-2 mt-1">
               <p className="text-4xl font-black text-slate-900">{pct}%</p>
               <p className="text-slate-400 text-sm">performance</p>
             </div>
             <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
             </div>
          </div>

          <div className="glass-panel p-8 hover:-translate-y-1">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                 <Clock size={24} />
               </div>
               <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">Log</span>
             </div>
             <p className="text-slate-500 font-medium">Study Hours</p>
             <div className="flex items-baseline gap-2 mt-1">
               <p className="text-4xl font-black text-slate-900">
                 {records.reduce((acc, curr) => acc + (curr.totalHours || 0), 0).toFixed(1)}h
               </p>
               <p className="text-slate-400 text-sm">total</p>
             </div>
          </div>
        </div>

        {/* History Table */}
        <div className="premium-card p-0 overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center">
             <h2 className="text-2xl font-black text-slate-900">Attendance Log</h2>
             <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
               View Full Report <ChevronRight size={16} />
             </button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                   <th className="px-8 py-4">Date</th>
                   <th className="px-8 py-4">Check In</th>
                   <th className="px-8 py-4">Check Out</th>
                   <th className="px-8 py-4">Status</th>
                   <th className="px-8 py-4 text-right">Duration</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {records.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium italic">No attendance records found for your account.</td>
                   </tr>
                 ) : (
                   records.map(record => (
                     <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5">
                         <p className="text-slate-900 font-bold">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                         <p className="text-xs text-slate-400">{format(new Date(record.date), 'EEEE')}</p>
                       </td>
                       <td className="px-8 py-5 text-slate-600 font-medium">
                         {format(new Date(record.loginTime), 'hh:mm a')}
                       </td>
                       <td className="px-8 py-5 text-slate-600">
                         {record.logoutTime ? (
                            <span className="font-medium">{format(new Date(record.logoutTime), 'hh:mm a')}</span>
                         ) : record.date === format(new Date(), 'yyyy-MM-dd') ? (
                           <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs ring-1 ring-blue-100 px-2 py-0.5 rounded-full bg-blue-50">
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                             Active
                           </span>
                         ) : (
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] uppercase font-bold">Missed Logout</span>
                         )}
                       </td>
                       <td className="px-8 py-5">
                         {record.isLate ? (
                           <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold text-[10px] uppercase tracking-wider">Late ({record.lateDelayMinutes}m)</span>
                         ) : (
                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-[10px] uppercase tracking-wider">On Time</span>
                         )}
                       </td>
                       <td className="px-8 py-5 text-right text-slate-900 font-black">
                         {record.totalHours ? `${record.totalHours}h` : '-'}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  )
}

