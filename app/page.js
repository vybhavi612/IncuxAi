"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [studentId, setStudentId] = useState('')
  const [course, setCourse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [role, setRole] = useState('STUDENT') // or ADMIN
  
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
    const payload = isRegister 
      ? { email, password, name, role, phone, studentId, course } 
      : { email, password }
      
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      if (isRegister) {
        setIsRegister(false) // switch to login on success
        setError('Registered successfully! Please sign in.')
      } else {
        if (data.user.role === 'ADMIN') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard/student')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 scale-105">
        <Image 
          src="/bg.png" 
          alt="Educational Background" 
          fill 
          priority
          className="object-cover opacity-60 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-lg p-8 glass-panel animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4 animate-float">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Attendance Portal
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {isRegister ? 'Join our academic community' : 'Sign in to access your portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className={`p-4 text-sm rounded-xl border animate-in slide-in-from-top-2 ${error.includes('successfully') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <div className="flex items-center gap-2">
                <span className="shrink-0">●</span>
                {error}
              </div>
            </div>
          )}

          {isRegister && (
             <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Account Type</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setRole('STUDENT')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Student
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('ADMIN')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Administrator
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                    placeholder="+91 ..."
                  />
                </div>

                {role === 'STUDENT' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Student ID</label>
                      <input 
                        type="text" 
                        required 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                        placeholder="ID-12345"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Course Name</label>
                      <input 
                        type="text" 
                        required 
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                        placeholder="B.Tech Computer Science"
                      />
                    </div>
                  </>
                )}
             </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 backdrop-blur-md"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 mt-4"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : isRegister ? 'Create Account' : 'Sign In To Portal'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500">
          {isRegister ? (
            <p>Already have an account? <button onClick={() => setIsRegister(false)} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign In</button></p>
          ) : (
            <p>New to the portal? <button onClick={() => setIsRegister(true)} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Create Account</button></p>
          )}
        </div>
      </div>
    </div>
  )
}

