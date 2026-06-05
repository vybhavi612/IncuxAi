import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { ShieldAlert, Download, Search, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SystemAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Query Filters state
  const [filters, setFilters] = useState({
    search: '',
    action: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalPages: 1,
    totalLogs: 0
  });

  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: pagination.limit,
        search: filters.search,
        action: filters.action
      });

      const res = await axios.get(`${API_URL}/admin/logs?${queryParams.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(prev => ({
          ...prev,
          page: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalLogs: res.data.totalLogs
        }));
      }
    } catch (error) {
      console.error('Error fetching activity audit logs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters.action]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/logs/export`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Export logs failed:', error.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-rose-500" /> System Audit Trail
            </h1>
            <p className="text-slate-400 mt-1">Audit user access, profile edits, clock actions, and database submissions.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 font-semibold rounded-lg text-sm transition-colors border border-indigo-750 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Exporting...' : 'Export Audit CSV'}
            </button>
            <button 
              onClick={() => fetchLogs(pagination.page)}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by intern name, email, or log details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </form>

          {/* Action Filter */}
          <div className="w-full md:w-auto">
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full md:w-48 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All Action Types</option>
              <option value="register">Register</option>
              <option value="login">Login</option>
              <option value="clock-in">Clock In</option>
              <option value="clock-out">Clock Out</option>
              <option value="project-submit">Project Submit</option>
              <option value="project-review">Project Review</option>
              <option value="profile-update">Profile Update</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading audit records...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 italic text-sm">
              No audit logs match current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-450 border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Timestamp</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User / Email</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Action</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Details</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">IP / Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {logs.map((log) => {
                    const user = log.userId;
                    return (
                      <tr key={log._id} className="hover:bg-slate-850/20 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-200 block text-sm">
                            {user ? `${user.firstName} ${user.lastName}` : 'System'}
                          </span>
                          <span className="text-xs text-slate-450">{user?.email || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user?.role === 'admin' 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {user?.role || 'System'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-indigo-400 font-semibold text-xs font-mono">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 block font-mono">{log.ipAddress}</span>
                          <span className="text-[10px] text-slate-500 max-w-[150px] block truncate" title={log.device}>
                            {log.device}
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

        {/* Pagination Buttons */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalLogs} logs total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemAudit;
