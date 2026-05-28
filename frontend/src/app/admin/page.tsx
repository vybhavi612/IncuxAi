'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/navigation';
import { Shield, Users, Clock, GitPullRequest, Settings, FileSpreadsheet, Lock, UserPlus, Power, AlertTriangle, Check, RefreshCw, ClipboardList, Trash2, Edit } from 'lucide-react';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
  const { user, token, logout, apiUrl } = useAuth();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'monitor' | 'users' | 'ledger' | 'git' | 'policies' | 'audit' | 'reports'>('monitor');

  // Database models state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [gitMetrics, setGitMetrics] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Dynamic overlays & modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

  // Form input bindings
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'USER' | 'ADMIN'>('USER');
  const [formActive, setFormActive] = useState(true);
  const [formTimezone, setFormTimezone] = useState('America/New_York');
  const [formGithubUser, setFormGithubUser] = useState('');
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  // Override inputs
  const [overrideStatus, setOverrideStatus] = useState('PRESENT');
  const [overrideDuration, setOverrideDuration] = useState(480);
  const [overrideReason, setOverrideReason] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token && !user) {
      router.push('/');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Load initial ledger states
    fetchTelemetry();
    fetchUsers();
    fetchAttendanceLedger();
    fetchGitAnalytics();
    fetchSystemPolicies();
    fetchAuditTrail();

    // WebSockets live updates connection
    const socket = io(apiUrl);
    socket.emit('subscribe_admin', { adminId: user.id });

    // Live active sessions stream mapping
    socket.on('active_sessions_update', (sessions) => {
      setActiveSessions(sessions);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token, router]);

  // Telemetry pollers
  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${apiUrl}/attendance/active-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveSessions(data);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllUsers(data);
    } catch (e) {}
  };

  const fetchAttendanceLedger = async () => {
    try {
      const res = await fetch(`${apiUrl}/attendance/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAttendanceLogs(data);
    } catch (e) {}
  };

  const fetchGitAnalytics = async () => {
    try {
      const res = await fetch(`${apiUrl}/github/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGitMetrics(data);
    } catch (e) {}
  };

  const fetchSystemPolicies = async () => {
    try {
      const res = await fetch(`${apiUrl}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSettings(data);
    } catch (e) {}
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await fetch(`${apiUrl}/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAuditLogs(data);
    } catch (e) {}
  };

  // --- CONTROLLERS AND ACTIONS ---

  const handleForceClose = async (userId: string) => {
    if (!confirm('Are you sure you want to force-close this shift session? This triggers user logout.')) return;
    try {
      await fetch(`${apiUrl}/attendance/force-close/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTelemetry();
      fetchAttendanceLedger();
    } catch (e) {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          active: formActive,
          timezone: formTimezone,
          githubUsername: formGithubUser
        })
      });
      if (res.ok) {
        setShowAddUserModal(false);
        fetchUsers();
        // Clear forms
        setFormName(''); setFormEmail(''); setFormPassword(''); setFormGithubUser('');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create user');
      }
    } catch (e) {}
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole,
          active: formActive,
          timezone: formTimezone,
          githubUsername: formGithubUser,
          ...(formPassword && { password: formPassword })
        })
      });
      if (res.ok) {
        setShowEditUserModal(false);
        fetchUsers();
        // Reset password field
        setFormPassword('');
      }
    } catch (e) {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete user completely? This action is non-reversible and purges attendance and repository settings.')) return;
    try {
      await fetch(`${apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {}
  };

  const handleOverrideAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;
    try {
      const res = await fetch(`${apiUrl}/attendance/override/${selectedAttendance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: overrideStatus,
          duration: overrideDuration,
          overrideReason
        })
      });
      if (res.ok) {
        setShowOverrideModal(false);
        fetchAttendanceLedger();
        setOverrideReason('');
      }
    } catch (e) {}
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`${apiUrl}/users/${selectedUser.id}/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          repoName,
          repoUrl
        })
      });
      if (res.ok) {
        setRepoName(''); setRepoUrl('');
        // Refresh selected user profiles
        const freshUser = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        setSelectedUser(freshUser);
        fetchUsers();
      }
    } catch (e) {}
  };

  const handleRemoveRepo = async (repoId: string) => {
    try {
      await fetch(`${apiUrl}/users/repos/${repoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh selected user profiles
      const freshUser = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());
      setSelectedUser(freshUser);
      fetchUsers();
    } catch (e) {}
  };

  const handleSyncDeveloper = async (userId: string) => {
    setLoading(true);
    try {
      await fetch(`${apiUrl}/github/sync/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGitAnalytics();
    } catch (e) {}
    setLoading(false);
  };

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('System policy parameters saved successfully.');
        fetchSystemPolicies();
      }
    } catch (e) {}
  };

  const openEditModal = (usr: any) => {
    setSelectedUser(usr);
    setFormName(usr.name);
    setFormEmail(usr.email);
    setFormRole(usr.role);
    setFormActive(usr.active);
    setFormTimezone(usr.timezone);
    setFormGithubUser(usr.githubUsername || '');
    setFormPassword('');
    setShowEditUserModal(true);
  };

  const openOverrideModal = (log: any) => {
    setSelectedAttendance(log);
    setOverrideStatus(log.status);
    setOverrideDuration(log.duration || 480);
    setOverrideReason(log.overrideReason || '');
    setShowOverrideModal(true);
  };

  const openRepoModal = (usr: any) => {
    setSelectedUser(usr);
    setShowRepoModal(true);
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-200">
      
      {/* Premium Header */}
      <header className="border-b border-indigo-500/10 bg-obsidian-800/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-premium-ring animate-pulse">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-100 block">WorkPulse</span>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Enterprise Admin Gate</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-semibold text-slate-200 block">{user?.name}</span>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Master Admin</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-950/40 border border-slate-700/80 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main layout container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Admin Controls tab grid */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/60 max-w-4xl">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Active Desk monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" />
            <span>Employees</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Shift Overrides</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'git' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Git Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-4 h-4" />
            <span>System Policies</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Audit trail</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Portal</span>
          </button>
        </div>

        {/* Tab layouts */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            
            {/* Ambient telemetry indicators panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-panel rounded-2xl p-5 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Staff Clocked-In</span>
                <div className="text-4xl font-extrabold text-indigo-400 mt-2 glow-text">{activeSessions.length}</div>
              </div>
              <div className="glass-panel rounded-2xl p-5 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Staff Count</span>
                <div className="text-4xl font-extrabold text-slate-200 mt-2">{allUsers.filter(u => u.role === 'USER').length}</div>
              </div>
              <div className="glass-panel rounded-2xl p-5 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overdue shifts (&gt;12h)</span>
                <div className="text-4xl font-extrabold text-amber-400 mt-2">
                  {activeSessions.filter(s => (Date.now() - new Date(s.loginTime).getTime()) > 43200000).length}
                </div>
              </div>
            </div>

            {/* Active Telemetry list */}
            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 live-dot" />
                  <span>Real-Time Desk Telemetry Console</span>
                </h3>
                <button onClick={fetchTelemetry} className="p-2 rounded-lg bg-slate-800 text-indigo-400 hover:bg-slate-700 border border-slate-700/80 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Employee</th>
                      <th className="pb-3">Clocked In (UTC)</th>
                      <th className="pb-3">Client Timezone</th>
                      <th className="pb-3">Host Device agent</th>
                      <th className="pb-3">IP Address</th>
                      <th className="pb-3 pr-2 text-right">Emergency Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {activeSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No active employees currently clocked in today.
                        </td>
                      </tr>
                    ) : (
                      activeSessions.map((sess) => (
                        <tr key={sess.id} className="hover:bg-slate-800/10">
                          <td className="py-4 pl-2">
                            <span className="font-bold text-slate-200 block">{sess.user?.name}</span>
                            <span className="text-xs text-slate-400">{sess.user?.email}</span>
                          </td>
                          <td className="py-4 text-indigo-400 font-mono font-semibold">{new Date(sess.loginTime).toLocaleTimeString()}</td>
                          <td className="py-4 text-slate-400 font-medium">{sess.user?.timezone}</td>
                          <td className="py-4 text-xs text-slate-500 truncate max-w-xs" title={sess.deviceMetadata}>{sess.deviceMetadata}</td>
                          <td className="py-4 text-slate-400 font-mono">{sess.ipAddress}</td>
                          <td className="py-4 pr-2 text-right">
                            <button
                              onClick={() => handleForceClose(sess.user?.id)}
                              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto transition-all"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>FORCE LOGOUT</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">Corporate Employee Roster</h3>
              <button
                onClick={() => {
                  setFormName(''); setFormEmail(''); setFormPassword(''); setFormGithubUser('');
                  setShowAddUserModal(true);
                }}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-premium-ring transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Name</th>
                      <th className="pb-3">Security Role</th>
                      <th className="pb-3">Account Status</th>
                      <th className="pb-3">Connected Repos</th>
                      <th className="pb-3 text-right pr-2">Management Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {allUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-800/10">
                        <td className="py-4 pl-2">
                          <span className="font-bold text-slate-200 block">{usr.name}</span>
                          <span className="text-xs text-slate-400">{usr.email}</span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${usr.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${usr.active ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span>{usr.active ? 'Active' : 'Disabled'}</span>
                          </span>
                        </td>
                        <td className="py-4">
                          {usr.role === 'USER' ? (
                            <button
                              onClick={() => openRepoModal(usr)}
                              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <span>Configure Repos</span>
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditModal(usr)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                              title="Edit settings"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 rounded-lg transition-all"
                              title="Delete profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Past Shift ledger Overrides Console</h3>

            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Employee</th>
                      <th className="pb-3">Checked In</th>
                      <th className="pb-3">Checked Out</th>
                      <th className="pb-3">Duration Log</th>
                      <th className="pb-3">Shift Status</th>
                      <th className="pb-3">Overrides</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/10">
                        <td className="py-4 pl-2">
                          <span className="font-bold text-slate-200 block">{log.user?.name}</span>
                          <span className="text-xs text-slate-400">{log.user?.email}</span>
                        </td>
                        <td className="py-4 text-slate-400">{new Date(log.checkIn).toLocaleString()}</td>
                        <td className="py-4 text-slate-400">{log.checkOut ? new Date(log.checkOut).toLocaleString() : 'ACTIVE'}</td>
                        <td className="py-4 text-slate-200">{log.duration ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m` : '0m'}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : log.status === 'INCOMPLETE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-medium">
                          {log.adminOverride ? (
                            <span className="text-indigo-400 cursor-help" title={log.overrideReason || ''}>
                              MODIFIED
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => openOverrideModal(log)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
                          >
                            Override
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'git' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Developer Git productivity ratings</h3>

            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Developer Name</th>
                      <th className="pb-3">Linked Repos</th>
                      <th className="pb-3">Commits (7d)</th>
                      <th className="pb-3">Active Streak</th>
                      <th className="pb-3">Productivity Rating</th>
                      <th className="pb-3">Alert status</th>
                      <th className="pb-3 text-right pr-2">Sync Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {gitMetrics.map((gm) => (
                      <tr key={gm.id} className="hover:bg-slate-800/10">
                        <td className="py-4 pl-2 font-bold text-slate-200">{gm.name}</td>
                        <td className="py-4 text-slate-400 font-mono">{gm.activeReposCount} Repos</td>
                        <td className="py-4 font-semibold text-slate-200">{gm.metricsSummary?.commits || 0}</td>
                        <td className="py-4 font-bold text-slate-200">{gm.metricsSummary?.streak || 0} Days</td>
                        <td className="py-4 font-extrabold text-indigo-400">{gm.metricsSummary?.score || 0}%</td>
                        <td className="py-4">
                          {gm.metricsSummary?.inactive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/20 text-red-400 text-xs font-bold border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              <span>INACTIVE</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">PUNCHY</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => handleSyncDeveloper(gm.id)}
                            disabled={loading}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-all"
                            title="Force Sync GitHub API"
                          >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Master System Policies Dashboard</h3>

            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <form onSubmit={handleSavePolicies} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Self-Registration Allowed</label>
                  <select
                    value={settings.registration_allowed || 'true'}
                    onChange={(e) => setSettings({ ...settings, registration_allowed: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  >
                    <option value="true">YES - Allow self-signup (Toggle toggleable)</option>
                    <option value="false">NO - Restriction: Admin-created accounts only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shift Force-Closure Policy</label>
                  <select
                    value={settings.force_close_policy || 'INCOMPLETE'}
                    onChange={(e) => setSettings({ ...settings, force_close_policy: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  >
                    <option value="INCOMPLETE">Option A: Mark Attendance Incomplete (Calculates elapsed minutes)</option>
                    <option value="ABSENT">Option B: Mark Attendance Absent (Nullifies hours for shift day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Minimum Hours Target (Daily)</label>
                  <input
                    type="number"
                    value={settings.min_working_hours || '8'}
                    onChange={(e) => setSettings({ ...settings, min_working_hours: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Automatic Session Timeout cut-off (Hours)</label>
                  <input
                    type="number"
                    value={settings.session_timeout_hours || '12'}
                    onChange={(e) => setSettings({ ...settings, session_timeout_hours: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Clock-ins active past this threshold will be force closed by background automation.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-premium-ring transition-all"
                >
                  Apply Settings Policies
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Master Audit Trail Security logs</h3>

            <div className="glass-panel rounded-3xl p-6 shadow-glass-glow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Timestamp (UTC)</th>
                      <th className="pb-3">Actor Entity</th>
                      <th className="pb-3">Action Description</th>
                      <th className="pb-3">Target category</th>
                      <th className="pb-3 pr-2">Metadata payloads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-[13px] font-mono text-slate-400">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/10">
                        <td className="py-3 pl-2 text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 text-slate-300 font-bold">{log.actor ? log.actor.name : 'SYSTEM_SCHEDULER'}</td>
                        <td className="py-3 text-indigo-300 font-semibold">{log.action}</td>
                        <td className="py-3 text-slate-500">{log.entityType}</td>
                        <td className="py-3 pr-2 text-xs max-w-sm truncate text-slate-500" title={log.metadata}>{log.metadata || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">CSV & Document Exports</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="glass-panel rounded-3xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-200 text-md mb-2">Shift Attendance Records</h4>
                <p className="text-xs text-slate-500 mb-6">Exports complete time stamp histories, override indicators, reasons, and active minutes.</p>
                <div className="flex gap-4">
                  <a
                    href={`${apiUrl}/reports/export?format=csv&category=attendance&token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs uppercase tracking-wider border border-slate-700 rounded-xl text-center"
                  >
                    Download CSV
                  </a>
                  <a
                    href={`${apiUrl}/reports/export?format=print&category=attendance&token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center"
                  >
                    Print Report
                  </a>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-200 text-md mb-2">GitHub Productivity Records</h4>
                <p className="text-xs text-slate-500 mb-6">Exports lines of code changes, PR ratios, issues opened, streaks, and ratings.</p>
                <div className="flex gap-4">
                  <a
                    href={`${apiUrl}/reports/export?format=csv&category=productivity&token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs uppercase tracking-wider border border-slate-700 rounded-xl text-center"
                  >
                    Download CSV
                  </a>
                  <a
                    href={`${apiUrl}/reports/export?format=print&category=productivity&token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center"
                  >
                    Print Report
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* --- ADD USER MODAL POPUP --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full relative">
            <h4 className="text-xl font-bold text-slate-100 mb-6">Create New User Profile</h4>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
                <input type="password" required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" placeholder="user123" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">System Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none">
                  <option value="USER">USER (Standard Employee)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL POPUP --- */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full relative">
            <h4 className="text-xl font-bold text-slate-100 mb-6">Modify User Profile</h4>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password (Leave blank to keep current)</label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub Username</label>
                <input type="text" value={formGithubUser} onChange={(e) => setFormGithubUser(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">System Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="userActive" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="userActive" className="text-xs font-semibold text-slate-400 uppercase">Account Enabled</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- OVERRIDE SHIFT MODAL POPUP --- */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full relative">
            <h4 className="text-xl font-bold text-slate-100 mb-6">Override Attendance Ledger Record</h4>
            <form onSubmit={handleOverrideAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status Override</label>
                <select value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none">
                  <option value="PRESENT">PRESENT</option>
                  <option value="INCOMPLETE">INCOMPLETE</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Duration (Minutes)</label>
                <input type="number" required value={overrideDuration} onChange={(e) => setOverrideDuration(parseInt(e.target.value))} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Override Rationale Reason</label>
                <textarea required value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-200 focus:outline-none" rows={3} placeholder="e.g. Employee forgot to clock out - checked manual desk clocks." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowOverrideModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Apply Override</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIGURE REPOS MODAL POPUP --- */}
      {showRepoModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-lg w-full relative">
            <h4 className="text-xl font-bold text-slate-100 mb-2">Configure Repositories</h4>
            <p className="text-xs text-slate-500 mb-6">Assigning repositories for: <strong className="text-slate-300">{selectedUser.name}</strong></p>
            
            {/* List of repositories */}
            <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-1">
              {selectedUser.repositories?.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No repositories assigned to this developer.</p>
              ) : (
                selectedUser.repositories?.map((r: any) => (
                  <div key={r.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="truncate pr-4">
                      <span className="font-bold text-slate-300 block">{r.repoName}</span>
                      <span className="text-[10px] text-slate-500">{r.repoUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRepo(r.id)}
                      className="p-1.5 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Repository Form */}
            <form onSubmit={handleAddRepo} className="border-t border-slate-800 pt-4 space-y-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Add Repository Link</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Repo Name</label>
                  <input type="text" required value={repoName} onChange={(e) => setRepoName(e.target.value)} className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-xs focus:outline-none" placeholder="workpulse-app" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Repo URL</label>
                  <input type="text" required value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 text-xs focus:outline-none" placeholder="https://github.com/org/repo" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Assign Repo Link
              </button>
            </form>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowRepoModal(false)} className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
