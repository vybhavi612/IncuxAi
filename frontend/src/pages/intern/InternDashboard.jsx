import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Clock, CheckCircle, AlertTriangle, Calendar, Award, BookOpen, ChevronRight, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InternDashboard = () => {
  const { user } = useAuth();
  
  // Real-Time Local Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Clock state
  const [status, setStatus] = useState({
    loading: true,
    hasClockedInToday: false,
    activeSession: null,
    todayRecord: null
  });
  
  // User analytics state
  const [analytics, setAnalytics] = useState(null);
  
  // Recent project submissions & attendance logs
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  
  // Local state for interactive loading
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Clock run interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial status and data
  const fetchData = async () => {
    try {
      // Get clock status
      const statusRes = await axios.get(`${API_URL}/attendance/status`);
      if (statusRes.data.success) {
        setStatus({
          loading: false,
          hasClockedInToday: statusRes.data.hasClockedInToday,
          activeSession: statusRes.data.activeSession,
          todayRecord: statusRes.data.todayRecord
        });
      }

      // Get my analytics
      const analyticsRes = await axios.get(`${API_URL}/analytics/my`);
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      // Get attendance logs
      const attendanceRes = await axios.get(`${API_URL}/attendance/my`);
      if (attendanceRes.data.success) {
        setRecentLogs(attendanceRes.data.data.slice(0, 5));
      }

      // Get projects
      const projectsRes = await axios.get(`${API_URL}/projects/my`);
      if (projectsRes.data.success) {
        setRecentProjects(projectsRes.data.data.slice(0, 3));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clock In action
  const handleClockIn = async () => {
    setBtnLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/attendance/clock-in`);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to clock in. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  // Clock Out action
  const handleClockOut = async () => {
    setBtnLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/attendance/clock-out`);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to clock out. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  // Helper to calculate session stopwatch
  const getSessionTimer = () => {
    if (!status.activeSession) return null;
    const clockInTime = new Date(status.activeSession.clockIn);
    const diffMs = currentTime - clockInTime;
    if (diffMs < 0) return '00:00:00';
    
    const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const getPunctualityColor = (rate) => {
    if (rate >= 90) return 'text-emerald-400';
    if (rate >= 75) return 'text-blue-400';
    if (rate >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Hello, {user?.firstName || 'Intern'}!
            </h1>
            <p className="text-slate-400 mt-1">Track your attendance, manage repository reviews, and check analytics in real-time.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-300">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left: Clock-In and Metrics */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Real-time Clock Card */}
            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Intern Attendance Node</span>
                
                {/* Glowing Digital Time */}
                <h2 className="text-5xl md:text-6xl font-black font-mono tracking-widest text-white mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </h2>

                {/* Clock Status text */}
                <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-slate-950 border border-slate-800">
                  {status.loading ? (
                    <span className="text-slate-400">Syncing server state...</span>
                  ) : status.activeSession ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-emerald-400 font-semibold">Active Session: {getSessionTimer()}</span>
                    </>
                  ) : status.hasClockedInToday ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-400 font-semibold">Clocked out today. See you tomorrow!</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-amber-400 font-semibold">Not Clocked In Today</span>
                    </>
                  )}
                </div>

                {errorMsg && (
                  <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg max-w-md">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Clock Actions Button */}
                <div className="mt-8 w-full max-w-sm">
                  {status.loading ? (
                    <button disabled className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-bold border border-slate-700 cursor-not-allowed">
                      Syncing...
                    </button>
                  ) : status.activeSession ? (
                    <button
                      onClick={handleClockOut}
                      disabled={btnLoading}
                      className="group w-full py-4 rounded-xl font-bold bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {btnLoading ? 'Processing...' : 'Clock Out of Session'}
                    </button>
                  ) : status.hasClockedInToday ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-slate-950 text-slate-500 font-bold border border-slate-850 cursor-not-allowed"
                    >
                      Attendance Logged for Today
                    </button>
                  ) : (
                    <button
                      onClick={handleClockIn}
                      disabled={btnLoading}
                      className="group w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {btnLoading ? 'Processing...' : 'Clock In Today'}
                    </button>
                  )}
                </div>

                {status.todayRecord && (
                  <div className="mt-6 text-sm text-slate-400">
                    Clocked in today at:{' '}
                    <span className="font-semibold text-slate-300">
                      {new Date(status.todayRecord.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {status.todayRecord.status === 'late' && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Late by {status.todayRecord.lateBy} min
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Metric 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Punctuality Rate</span>
                  <span className={`text-xl font-black ${getPunctualityColor(analytics?.metrics?.punctualityRate || 100)}`}>
                    {analytics ? `${analytics.metrics.punctualityRate}%` : '---'}
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Active Badges</span>
                  <span className="text-xl font-black text-purple-400">
                    {analytics?.badges?.[0]?.name || 'Rising Star'}
                  </span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Completed Projects</span>
                  <span className="text-xl font-black text-emerald-400">
                    {analytics ? `${analytics.metrics.approvedProjects} / ${analytics.metrics.totalProjects}` : '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Attendance Logs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-200">Recent Attendance Logs</h3>
                <a href="/intern/attendance" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center">
                  View All Logs <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No clock sessions logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Clock In</th>
                        <th className="py-2.5">Clock Out</th>
                        <th className="py-2.5">Duration</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log._id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-colors">
                          <td className="py-3 font-medium text-slate-300">{log.date}</td>
                          <td className="py-3 text-slate-400">
                            {new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 text-slate-400">
                            {log.clockOut 
                              ? new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                              : <span className="text-emerald-400 font-semibold animate-pulse">Active</span>
                            }
                          </td>
                          <td className="py-3 text-slate-400">
                            {log.clockOut ? `${log.sessionDuration} mins` : '---'}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                              log.status === 'on-time' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : log.status === 'late'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {log.status === 'on-time' ? 'On Time' : log.status === 'late' ? 'Late' : log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: AI recommendation & Recent Submissions */}
          <div className="space-y-8">
            
            {/* Profile Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 overflow-hidden mb-4">
                {user?.profilePhotoURL ? (
                  <img src={user.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-200">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">Intern Profile</p>
              <p className="text-xs text-slate-400 mt-2">{user?.email}</p>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-lg text-purple-400 mb-3 flex items-center gap-2">
                <span>🤖</span> AI Performance Insight
              </h3>
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-sm leading-relaxed text-slate-300">
                {analytics?.aiRecommendation ? (
                  analytics.aiRecommendation
                ) : (
                  "Establishing metrics baseline. Complete clock-in logging and submit project repositories to generate real-time feedback recommendations."
                )}
              </div>
            </div>

            {/* Recent GitHub Submissions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-200">My Submissions</h3>
                <a href="/intern/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center">
                  All submissions <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No projects submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project._id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-slate-200 truncate max-w-[150px]">
                          {project.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          project.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : project.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{project.githubUrl}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default InternDashboard;
