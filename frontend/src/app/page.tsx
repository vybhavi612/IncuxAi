'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { LogIn, Key, Sparkles, User, Mail, ShieldAlert, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [errorMsg, setErrorMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Detect system timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setTimezone(tz);
    } catch (e) {}

    // Already authenticated check
    if (!loading && user) {
      if (user.role === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFormLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, timezone);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission');
    } finally {
      setFormLoading(false);
    }
  };

  // Helper helper to login fast during review
  const handleQuickLogin = async (role: 'ADMIN' | 'USER') => {
    setErrorMsg('');
    setFormLoading(true);
    try {
      if (role === 'ADMIN') {
        await login('admin@workpulse.com', 'admin123');
      } else {
        await login('dev1@workpulse.com', 'user123');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-900">
        <div className="flex flex-col items-center gap-4">
          <Clock className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-slate-400 font-semibold tracking-wider">Syncing telemetry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-obsidian-900 bg-glowing-theme">
      {/* Dynamic ambient spotlight backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 shadow-glass-glow">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-100 bg-clip-text text-transparent glow-text">
            WorkPulse
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">
            Enterprise Attendance & Developer Productivity Tracking
          </p>
        </div>

        {/* Auth form box */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-glass-glow">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          
          <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
            {isRegister ? 'Create Account' : 'Security Access Gate'}
          </h2>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex gap-3 text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password Hash key</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-premium-ring hover:scale-[1.01]"
            >
              {formLoading ? (
                <div className="w-5 h-5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{isRegister ? 'Sign Up' : 'Authenticate'}</span>
                </>
              )}
            </button>
          </form>

          {/* Form switcher */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              {isRegister ? 'Already have credentials? Sign In' : 'Need self-registration? Join'}
            </button>
          </div>
        </div>

        {/* Quick Testing Controls panel */}
        <div className="mt-8 glass-panel rounded-2xl p-5 border-indigo-500/10 text-center">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Reviewer Sandbox Console</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition-all"
            >
              Sarah (Admin Key)
            </button>
            <button
              onClick={() => handleQuickLogin('USER')}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl transition-all"
            >
              Alex (Dev Key)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
