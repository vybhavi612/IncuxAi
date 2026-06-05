import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InternAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    totalMins: 0
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/attendance/my`);
      if (res.data.success) {
        setLogs(res.data.data);
        
        // Calculate basic local stats
        const data = res.data.data;
        const total = data.length;
        const onTime = data.filter(l => l.status === 'on-time').length;
        const late = data.filter(l => l.status === 'late').length;
        const totalMins = data.reduce((sum, l) => sum + (l.sessionDuration || 0), 0);

        setStats({ total, onTime, late, totalMins });
      }
    } catch (error) {
      console.error('Error fetching logs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatHours = (mins) => {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">My Attendance logs</h1>
            <p className="text-slate-400 mt-1">Review your full timeline of clock-in and clock-out sessions.</p>
          </div>
          <button 
            onClick={fetchAttendance}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md text-center">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Total Days Logged</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.total}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md text-center">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">On-Time Days</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{stats.onTime}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md text-center">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Late Arrivals</span>
            <span className="text-3xl font-black text-rose-400 mt-1 block">{stats.late}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md text-center">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Total Hours Engaged</span>
            <span className="text-3xl font-black text-indigo-400 mt-1 block">{formatHours(stats.totalMins)}</span>
          </div>
        </div>

        {/* Main List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-medium">Loading history logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="w-12 h-12 text-slate-650 mx-auto mb-4" />
              <p className="text-slate-400">No attendance history logged yet.</p>
              <p className="text-xs text-slate-500 mt-1">Clock in on the dashboard to create your first attendance record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clock-In Time</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clock-Out Time</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Late By</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{log.date}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-slate-350">
                        {log.clockOut ? (
                          new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                        ) : (
                          <span className="text-emerald-400 font-semibold animate-pulse">Active Session</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          log.status === 'on-time' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {log.status === 'on-time' ? 'On Time' : 'Late'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.status === 'late' ? (
                          <span className="text-rose-400 font-semibold">{log.lateBy} mins</span>
                        ) : (
                          <span className="text-slate-500">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {log.clockOut ? formatHours(log.sessionDuration) : 'In Progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InternAttendance;
