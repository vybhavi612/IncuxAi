import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import socket from '../../services/socket';
import { Calendar, Download, RefreshCw, AlertCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LiveAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalLogged: 0,
    active: 0,
    late: 0,
    onTime: 0,
    absent: 0
  });

  const [exportLoading, setExportLoading] = useState(false);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const summaryRes = await axios.get(`${API_URL}/attendance/summary`);
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
        setLogs(summaryRes.data.todayLogs);
      }
    } catch (error) {
      console.error('Error fetching today summary roster:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();

    // Refresh automatically on live socket updates
    socket.on('attendance_update', (data) => {
      console.log('Roster live update:', data);
      fetchAttendanceData();
    });

    return () => {
      socket.off('attendance_update');
    };
  }, []);

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Secure authenticated download
      const res = await axios.get(`${API_URL}/admin/attendance/export`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `intern_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('CSV Export failed:', error.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Today's Attendance Roster</h1>
            <p className="text-slate-400 mt-1">Surveil and export intern attendance activities logged today.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 font-semibold rounded-lg text-sm transition-colors border border-indigo-750 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Exporting...' : 'Export CSV Report'}
            </button>
            <button 
              onClick={fetchAttendanceData}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-450 block uppercase tracking-wider font-semibold">Total Logged</span>
            <span className="text-2xl font-black text-white mt-1 block">{summary.totalLogged}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-450 block uppercase tracking-wider font-semibold">Active Hours</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">{summary.active}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-455 block uppercase tracking-wider font-semibold">On-Time</span>
            <span className="text-2xl font-black text-emerald-450 mt-1 block">{summary.onTime}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-450 block uppercase tracking-wider font-semibold">Late</span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">{summary.late}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <span className="text-xs text-slate-450 block uppercase tracking-wider font-semibold">Absent</span>
            <span className="text-2xl font-black text-slate-400 mt-1 block">{summary.absent}</span>
          </div>
        </div>

        {/* Table Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading today's logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No intern attendance logged today.</p>
              <p className="text-xs text-slate-500 mt-1">Logs will automatically stream in when interns clock in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-450 border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Intern</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clock In</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clock Out</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Late By</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total Duration</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {logs.map((log) => {
                    const intern = log.internId;
                    return (
                      <tr key={log._id} className="hover:bg-slate-850/20 transition-colors">
                        
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex-shrink-0">
                            {intern?.profilePhotoURL ? (
                              <img src={intern.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-450">
                                {intern?.firstName?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {intern?.firstName} {intern?.lastName}
                            </span>
                            <span className="text-xs text-slate-450">{intern?.email}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-300 font-mono">
                          {new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="px-6 py-4 text-slate-350 font-mono">
                          {log.clockOut ? (
                            new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 animate-spin" /> Active
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {log.status === 'late' ? (
                            <span className="text-rose-400 font-semibold">{log.lateBy} min</span>
                          ) : (
                            <span className="text-slate-500">---</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-350">
                          {log.clockOut ? `${log.sessionDuration} mins` : 'In Session'}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            log.status === 'on-time' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.status === 'on-time' ? 'On Time' : 'Late'}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LiveAttendance;
