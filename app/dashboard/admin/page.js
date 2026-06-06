"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Users, Download, Search, Settings, ShieldCheck, Mail, Calendar, ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          if (data.status === 403) router.push('/')
        } else {
          setStudents(data)
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
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck className="text-blue-600 animate-bounce" size={32} />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating Admin...</p>
      </div>
    </div>
  )
  
  if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase())
  )

  const todayString = format(new Date(), 'yyyy-MM-dd')
  let totalPresentToday = 0
  let totalLateToday = 0

  students.forEach(s => {
    const todayRec = s.attendances.find(a => a.date === todayString)
    if (todayRec) {
      totalPresentToday++
      if (todayRec.isLate) totalLateToday++
    }
  })

  return (
    <div className="min-h-screen bg-brand-bg pb-12">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 block leading-tight">AdminPortal</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Centralized Control</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm">
              <Download size={16} /> Reports
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-8 group overflow-hidden relative">
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Enrollment</p>
                   <h3 className="text-4xl font-black text-slate-900">{students.length}</h3>
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Users size={28} />
                </div>
             </div>
             <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                <span>↑ 12%</span>
                <span className="text-slate-400 font-medium whitespace-nowrap text-xs uppercase">from last semester</span>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl" />
          </div>

          <div className="premium-card p-8 group overflow-hidden relative">
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Present Today</p>
                   <h3 className="text-4xl font-black text-slate-900">{totalPresentToday}</h3>
                </div>
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Calendar size={28} />
                </div>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-green-500 h-full" style={{ width: `${(totalPresentToday/students.length)*100 || 0}%` }} />
                </div>
                <span className="text-xs font-black text-slate-900">{Math.round((totalPresentToday/students.length)*100 || 0)}%</span>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50/50 rounded-full blur-2xl" />
          </div>

          <div className="premium-card p-8 group overflow-hidden relative border-amber-100">
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Late Arrivals</p>
                   <h3 className="text-4xl font-black text-slate-900">{totalLateToday}</h3>
                </div>
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Clock size={28} />
                </div>
             </div>
             <p className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                <Settings size={14} /> Attention required for persistent cases
             </p>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50/50 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Content Section */}
        <div className="premium-card p-0 shadow-2xl shadow-slate-200/50 border-slate-200">
           <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900">Student Roster</h2>
                <p className="text-slate-400 text-sm font-medium">Manage and monitor academic attendance records</p>
             </div>
             
             <div className="relative max-w-sm w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search student name, email or ID..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
               />
             </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                   <th className="px-8 py-5">Profile</th>
                   <th className="px-8 py-5">Course / ID</th>
                   <th className="px-8 py-5">Activity</th>
                   <th className="px-8 py-5">Late Hits</th>
                   <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredStudents.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold bg-white">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} />
                          </div>
                          <p>No matching student records found</p>
                        </div>
                     </td>
                   </tr>
                 ) : (
                   filteredStudents.map(student => {
                     const totalLate = student.attendances.filter(a => a.isLate).length;
                     const hasToday = student.attendances.some(a => a.date === todayString);
                     
                     return (
                       <tr key={student.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs border-2 border-white shadow-sm ring-1 ring-blue-50">
                                  {student.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-slate-900 font-black text-sm">{student.name}</p>
                                  <p className="text-slate-400 text-xs flex items-center gap-1"><Mail size={12} /> {student.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-slate-700 font-bold text-xs">{student.course}</p>
                            <p className="text-slate-400 text-[10px] font-mono mt-0.5">{student.studentId || 'N/A'}</p>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-slate-800 font-black text-sm">{student.attendances.length} days</p>
                            <div className="flex gap-1 mt-1.5">
                               {hasToday ? (
                                 <span className="w-2 h-2 bg-green-500 rounded-full" />
                               ) : (
                                 <span className="w-2 h-2 bg-slate-200 rounded-full" />
                               )}
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                 {hasToday ? 'Logged In Today' : 'Absent Today'}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                           {totalLate > 0 ? (
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full ring-1 ring-red-100">
                               <span className="text-xs font-black">{totalLate} times</span>
                             </div>
                           ) : (
                             <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full ring-1 ring-green-100">Clean Record</span>
                           )}
                         </td>
                         <td className="px-8 py-6 text-right">
                           <button className="inline-flex items-center gap-2 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:text-blue-800 transition-colors">
                              View Profile <ArrowRight size={14} />
                           </button>
                         </td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  )
}

