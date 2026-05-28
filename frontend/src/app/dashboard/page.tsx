'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/navigation';
import { Clock, Play, Power, Calendar, RefreshCw, GitCommit, GitPullRequest, GitFork, Award, Zap, LogOut, User, Settings, Lock, Check } from 'lucide-react';
import { io } from 'socket.io-client';

export default function UserDashboard() {
  const { user, token, logout, apiUrl, updateUserContext } = useAuth();
  const router = useRouter();

  const [activeSession, setActiveSession] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [gitData, setGitData] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  
  // Settings & forms
  const [activeTab, setActiveTab] = useState<'tracker' | 'git' | 'settings'>('tracker');
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loadingAction, setLoadingAction] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token && !user) {
      router.push('/');
      return;
    }

    if (user?.role === 'ADMIN') {
      router.push('/admin');
      return;
    }

    // Initialize inputs
    if (user) {
      setName(user.name);
      setTimezone(user.timezone);
      setGithubUsername(user.githubUsername || '');
    }

    fetchAttendanceStatus();
    fetchGithubMetrics();

    // Set up Realtime WebSockets
    const socket = io(apiUrl);
    
    socket.emit('register_user', { userId: user?.id });

    // Listen for forced administrative close logouts
    socket.on(`force_logout_${user?.id}`, (data) => {
      alert(data.reason);
      logout();
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, token, router]);

  // Desk clock ticking interval
  useEffect(() => {
    if (activeSession) {
      const checkInTime = new Date(activeSession.checkIn).getTime();
      
      timerRef.current = setInterval(() => {
        const diff = Date.now() - checkInTime;
        const secs = Math.floor(diff / 1000) % 60;
        const mins = Math.floor(diff / 60000) % 60;
        const hours = Math.floor(diff / 3600000);
        
        setTimeElapsed(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setTimeElapsed('00:00:00');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const fetchAttendanceStatus = async () => {
    try {
      const res = await fetch(`${apiUrl}/attendance/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveSession(data.active);
      setAttendanceHistory(data.history);
    } catch (e) {}
  };

  const fetchGithubMetrics = async () => {
    try {
      const res = await fetch(`${apiUrl}/github/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGitData(data);
    } catch (e) {}
  };

  const handleCheckIn = async () => {
    setLoadingAction(true);
    try {
      const clientFingerprint = `cf_${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '')}`;
      const res = await fetch(`${apiUrl}/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          localTimestamp: new Date().toLocaleTimeString(),
          timezone: timezone || 'UTC',
          browserFingerprint: clientFingerprint,
          ipAddress: '127.0.0.1', // Real production system gathers IP from request
          deviceMetadata: `${navigator.platform} / ${navigator.appName}`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Checkin failed');
      }

      await fetchAttendanceStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${apiUrl}/attendance/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          localTimestamp: new Date().toLocaleTimeString()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Checkout failed');
      }

      await fetchAttendanceStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSyncGit = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      await fetch(`${apiUrl}/github/sync/${user.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchGithubMetrics();
    } catch (e) {}
    setLoadingAction(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');
    try {
      const res = await fetch(`${apiUrl}/users/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, timezone, githubUsername, githubToken })
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      
      const updated = await res.json();
      updateUserContext({ name: updated.name, timezone: updated.timezone, githubUsername: updated.githubUsername });
      setFormSuccess('Profile configuration saved successfully.');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');
    try {
      const res = await fetch(`${apiUrl}/users/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Incorrect old password');
      }
      setFormSuccess('Credentials updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Helper date formatter
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-200">
      
      {/* Premium Header */}
      <header className="border-b border-slate-800/80 bg-obsidian-800/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-premium-ring">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-100 block">WorkPulse</span>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Developer Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-semibold text-slate-200 block">{user?.name}</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-950/40 border border-slate-700/80 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all duration-300"
              title="Logout session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main page wrapper */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/60 max-w-md">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'git' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Git Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile settings</span>
          </button>
        </div>

        {/* Tab content modules */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Action tracker column */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Tracker Panel */}
              <div className="glass-panel rounded-3xl p-6 shadow-glass-glow overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Shift Control Station</span>
                </h3>

                <div className="text-center py-6">
                  {/* Status Indicator */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-semibold uppercase tracking-wider mb-6">
                    <span className={`w-2.5 h-2.5 rounded-full live-dot ${activeSession ? 'bg-indigo-500' : 'bg-slate-600'}`} />
                    <span className={activeSession ? 'text-indigo-400 glow-text' : 'text-slate-400'}>
                      {activeSession ? 'RECORDING DESKTIME' : 'CLOCKED OUT'}
                    </span>
                  </div>

                  {/* Timer Display */}
                  <div className={`text-5xl font-mono font-bold tracking-tight text-slate-100 mb-8 ${activeSession ? 'glow-text text-indigo-300' : 'text-slate-500'}`}>
                    {timeElapsed}
                  </div>

                  {/* Checkin Action Buttons */}
                  <div className="space-y-4">
                    {!activeSession ? (
                      <button
                        onClick={handleCheckIn}
                        disabled={loadingAction}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-premium-ring hover:scale-[1.01] transition-all"
                      >
                        <Play className="w-5 h-5 fill-white" />
                        <span>MARK PRESENT (CHECK IN)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckOut}
                        disabled={loadingAction}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-all"
                      >
                        <Power className="w-5 h-5" />
                        <span>CHECK OUT (STOP SHIFT)</span>
                      </button>
                    )}
                    <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                      * Source of truth: Server-side logs. Desk timers operate via NTP-normalized synchronization.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Shift History Log Ledger */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
                <h3 className="text-lg font-bold text-slate-100 mb-6">Recent Shift Ledger Logs</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Checked In</th>
                        <th className="pb-3">Checked Out</th>
                        <th className="pb-3">Desk Time</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-2">Audits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {attendanceHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No shift records logged. Tap check-in above to start!
                          </td>
                        </tr>
                      ) : (
                        attendanceHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/20 transition-all">
                            <td className="py-4 pl-2 font-medium">
                              {new Date(item.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-4 text-slate-400">{formatTime(item.checkIn)}</td>
                            <td className="py-4 text-slate-400">{item.checkOut ? formatTime(item.checkOut) : 'ACTIVE'}</td>
                            <td className="py-4 text-slate-200">
                              {item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : '—'}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${item.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : item.status === 'INCOMPLETE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 pr-2">
                              {item.adminOverride ? (
                                <span className="text-indigo-400 text-xs font-semibold cursor-help" title={item.overrideReason || ''}>
                                  OVERRIDDEN
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">—</span>
                              )}
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
        )}

        {activeTab === 'git' && (
          <div className="space-y-8">
            {/* Git summary headers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak Calendar</span>
                  <Award className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-100 mb-1">{gitData?.currentStreak || 0} Days</div>
                <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Active Stream streak</div>
              </div>

              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commits Today</span>
                  <GitCommit className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-100 mb-1">
                  {gitData?.dailyScores?.[gitData.dailyScores.length - 1]?.commits || 0}
                </div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Pushed to repos</span>
              </div>

              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commits (30d)</span>
                  <GitFork className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-100 mb-1">{gitData?.weeklySummary?.commits || 0}</div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Total project commits</span>
              </div>

              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity rating</span>
                  <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-400 glow-text">{gitData?.weeklySummary?.averageProductivityScore || 0}%</div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Efficiency index</span>
              </div>

            </div>

            {/* Charts & timelines */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily index timelines */}
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-glass-glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-100">Productivity score Timeline</h3>
                  <button
                    onClick={handleSyncGit}
                    disabled={loadingAction}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-slate-700/80"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
                    <span>Sync Git</span>
                  </button>
                </div>

                {/* SVG timelines grid */}
                <div className="h-64 flex items-end gap-2 border-b border-l border-slate-800 pb-3 pl-3 pt-6 relative">
                  {gitData?.dailyScores?.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                      No GitHub records found. Connect repository in Profile settings!
                    </div>
                  ) : (
                    gitData?.dailyScores?.map((d: any, index: number) => (
                      <div
                        key={d.date}
                        className="flex-1 bg-gradient-to-t from-indigo-600 to-violet-400 rounded-t-md relative group chart-bar-glow"
                        style={{ height: `${d.score}%` }}
                      >
                        {/* Hover modal */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-950 border border-slate-800 rounded-xl hidden group-hover:block z-50 text-xs w-28 text-center shadow-lg font-sans">
                          <p className="font-bold text-indigo-400 mb-1">{d.date.split('-').slice(1).join('/')}</p>
                          <p className="font-medium">Commits: {d.commits}</p>
                          <p className="font-medium">Score: {d.score}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-semibold">
                  <span>30 Days ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Linked repositories lists */}
              <div className="lg:col-span-1 glass-panel rounded-3xl p-6 shadow-glass-glow">
                <h3 className="text-lg font-bold text-slate-100 mb-6">Assigned Repositories</h3>
                
                <div className="space-y-4">
                  {gitData?.repositories?.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-8">
                      No repositories connected. Contact an administrator to link repo.
                    </p>
                  ) : (
                    gitData?.repositories?.map((r: any) => (
                      <div key={r.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-indigo-500/30 transition-all">
                        <p className="font-bold text-slate-200 block truncate">{r.name}</p>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:underline block truncate mt-1"
                        >
                          {r.url}
                        </a>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="inline-flex px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                            {r.provider}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Synced today
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Profile form */}
            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>Developer settings</span>
              </h3>

              {formSuccess && <div className="mb-4 p-3.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">{formSuccess}</div>}
              {formError && <div className="mb-4 p-3.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">{formError}</div>}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Local Timezone</label>
                  <input
                    type="text"
                    required
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                    placeholder="e.g. America/New_York"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub Username</label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                    placeholder="octocat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                    placeholder="••••••••••••••••••••"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used to securely harvest metrics for your active streams.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                >
                  Save Profile Configuration
                </button>
              </form>
            </div>

            {/* Password edit form */}
            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <span>Security credentials</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition-all"
                >
                  Change Password key
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
