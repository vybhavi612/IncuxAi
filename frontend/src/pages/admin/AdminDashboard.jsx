import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import socket from '../../services/socket';
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Bell, AlertCircle, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  // Stats
  const [stats, setStats] = useState({
    activeInterns: 0,
    lateArrivals: 0,
    pendingProjects: 0,
    avgPunctuality: 100
  });

  // Active Sessions today
  const [activeSessions, setActiveSessions] = useState([]);
  
  // Real-time socket alerts log
  const [alerts, setAlerts] = useState([]);

  const fetchStats = async () => {
    try {
      // Fetch attendance summary
      const attendanceRes = await axios.get(`${API_URL}/attendance/summary`);
      let active = 0;
      let late = 0;
      if (attendanceRes.data.success) {
        active = attendanceRes.data.summary.active;
        late = attendanceRes.data.summary.late;
      }

      // Fetch projects
      const projectsRes = await axios.get(`${API_URL}/projects`);
      let pending = 0;
      if (projectsRes.data.success) {
        pending = projectsRes.data.data.filter(p => p.status === 'pending').length;
      }

      // Fetch analytics overview for average punctuality
      const analyticsRes = await axios.get(`${API_URL}/analytics/overview`);
      let punct = 100;
      if (analyticsRes.data.success) {
        punct = analyticsRes.data.data.avgWorkspacePunctuality;
      }

      setStats({
        activeInterns: active,
        lateArrivals: late,
        pendingProjects: pending,
        avgPunctuality: punct
      });

      // Fetch active sessions
      const activeRes = await axios.get(`${API_URL}/attendance/active`);
      if (activeRes.data.success) {
        setActiveSessions(activeRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error.message);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to Socket.io events for real-time dashboard updates
    socket.on('attendance_update', (data) => {
      console.log('Real-Time Attendance Update Received:', data);
      fetchStats();
    });

    socket.on('project_update', (data) => {
      console.log('Real-Time Project Update Received:', data);
      fetchStats();
    });

    socket.on('new_alert', (newAlert) => {
      console.log('Real-Time System Alert Received:', newAlert);
      setAlerts(prev => [
        {
          id: Math.random().toString(),
          ...newAlert
        },
        ...prev
      ].slice(0, 5)); // Keep only latest 5 alerts
    });

    return () => {
      socket.off('attendance_update');
      socket.off('project_update');
      socket.off('new_alert');
    };
  }, []);

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Shield className="w-8 h-8 text-indigo-500" /> Admin Command Center
            </h1>
            <p className="text-slate-400 mt-1">Real-time surveillance dashboard for attendance tracking and intern analytics.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Live Node Operational
          </div>
        </div>

        {/* Live Alerts Banners */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl flex items-center justify-between border shadow-lg animate-pulse ${
                  alert.type === 'late_arrival' 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-350'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-350'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="font-bold uppercase text-xs tracking-wider block">
                      {alert.type === 'late_arrival' ? 'Late Arrival Alert' : 'System Update'}
                    </span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 rounded-full hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Clocked-In</span>
            <span className="text-4xl font-black text-blue-500 mt-2 block">{stats.activeInterns}</span>
            <span className="text-xs text-slate-500 mt-2 block">Currently active on system</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Late Arrivals Today</span>
            <span className="text-4xl font-black text-rose-500 mt-2 block">{stats.lateArrivals}</span>
            <span className="text-xs text-slate-500 mt-2 block">Arrivals after 10:00 AM cutoff</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Code Reviews</span>
            <span className="text-4xl font-black text-amber-500 mt-2 block">{stats.pendingProjects}</span>
            <span className="text-xs text-slate-500 mt-2 block">Submissions awaiting feedback</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Punctuality</span>
            <span className="text-4xl font-black text-emerald-500 mt-2 block">{stats.avgPunctuality}%</span>
            <span className="text-xs text-slate-500 mt-2 block">Overall interns compliance rate</span>
          </div>
        </div>

        {/* Bottom grid: Active Sessions & Log Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Sessions today (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Active Sessions
              </h3>

              {activeSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle className="w-10 h-10 text-slate-750 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No active clock-ins found.</p>
                  <p className="text-xs text-slate-500 mt-1">All logged interns are clocked out or absent today.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-450 border-b border-slate-850">
                        <th className="pb-3 text-xs uppercase tracking-wider font-semibold">Intern</th>
                        <th className="pb-3 text-xs uppercase tracking-wider font-semibold">Clock In</th>
                        <th className="pb-3 text-xs uppercase tracking-wider font-semibold">IP Address</th>
                        <th className="pb-3 text-xs uppercase tracking-wider font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessions.map((session) => (
                        <tr key={session._id} className="border-b border-slate-850 hover:bg-slate-850/20 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                              {session.internId?.profilePhotoURL ? (
                                <img src={session.internId.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                                  {session.internId?.firstName?.[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-250 block">
                                {session.internId?.firstName} {session.internId?.lastName}
                              </span>
                              <span className="text-xs text-slate-450">{session.internId?.email}</span>
                            </div>
                          </td>
                          <td className="py-4 text-slate-350 font-mono">
                            {new Date(session.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 text-slate-400 text-xs font-mono">{session.ipAddress}</td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                              session.status === 'on-time' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {session.status === 'on-time' ? 'On Time' : 'Late'}
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

          {/* Right Live Socket Activities Feed Stream */}
          <div className="space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[400px]">
              <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" /> Live Feed Log
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-1.5 scrollbar-thin">
                {alerts.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-20 italic">
                    Listening for real-time clock and project updates...
                  </p>
                )}
                
                {alerts.map(a => (
                  <div key={a.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold uppercase tracking-wide text-[9px] ${
                        a.type === 'late_arrival' ? 'text-rose-400' : 'text-blue-400'
                      }`}>
                        {a.type === 'late_arrival' ? 'Late Arrival' : 'Activity'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(a.timestamp || new Date()).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-350">{a.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
