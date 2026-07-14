"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { AdminCharts } from "@/components/AdminCharts";
import {
  Users,
  ShieldAlert,
  Key,
  CreditCard,
  Search,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  license: "Pro" | "Basic" | "Enterprise";
  status: "Active" | "Suspended" | "Pending";
}

export default function AdminConsolePage() {
  const { user, auditLogs } = useApp();
  const router = useRouter();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "ADMIN") {
      // Direct access bypass/check: if they typed /admin but are not admin, take them back
      router.push("/dashboard");
    }
  }, [user, router]);

  // Mock User Provisioning list
  const [usersList, setUsersList] = useState<AdminUser[]>([
    { id: "au-1", name: "Alex Rivera", email: "alex.rivera@enterprise.com", role: "ORGANIZER", license: "Pro", status: "Active" },
    { id: "au-2", name: "Sarah Jenkins", email: "sarah.jenkins@enterprise.com", role: "ORGANIZER", license: "Pro", status: "Active" },
    { id: "au-3", name: "David Chen", email: "david.chen@enterprise.com", role: "ATTENDEE", license: "Basic", status: "Active" },
    { id: "au-4", name: "Admin Manager", email: "admin@enterprise.com", role: "ADMIN", license: "Enterprise", status: "Active" },
    { id: "au-5", name: "Elena Rostova", email: "elena.r@enterprise.com", role: "ATTENDEE", license: "Basic", status: "Pending" },
  ]);

  const [userSearch, setUserSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    triggerNotification("User role upgraded successfully.");
  };

  const handleLicenseChange = (userId: string, newLicense: AdminUser["license"]) => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, license: newLicense } : u))
    );
    triggerNotification("User workspace license tier updated.");
  };

  const handleStatusChange = (userId: string, newStatus: AdminUser["status"]) => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    triggerNotification("User accounts state modified.");
  };

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Filter users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex flex-row flex-1 min-h-screen bg-[#0B0F19]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Administration Console</h1>
            <p className="text-xs text-zinc-400">Manage organizational licenses, provisions, usage reports and audit histories.</p>
          </div>
          <button
            onClick={() => alert("Audit log data exported to CSV format.")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Reports
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-green-500/15 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn z-30 relative">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {successMsg}
          </div>
        )}

        {/* Core Organization Cards Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Provisioned Users</span>
              <span className="text-lg font-bold text-white mt-1 block">134 / 200 Licenses</span>
            </div>
          </div>

          <div className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">License Consumption</span>
              <span className="text-lg font-bold text-white mt-1 block">67% Active Use</span>
            </div>
          </div>

          <div className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Security Flag Status</span>
              <span className="text-lg font-bold text-white mt-1 block">0 Alerts (Healthy)</span>
            </div>
          </div>
        </section>

        {/* 1. Usage Charts Component */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Workspace Usage Analytics</h3>
          <AdminCharts />
        </section>

        {/* 2. User Provisioning & License Management */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">User Provisioning & Tier Billing</h3>
            
            {/* User Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text"
                placeholder="Search staff accounts..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-white/[0.03] border border-white/5 pl-9 pr-4 py-1.5 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 outline-none w-52 focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="bg-[#161D2F] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1C253B] border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role System</th>
                    <th className="p-4">License Type</th>
                    <th className="p-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01]">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 text-zinc-400 font-medium">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-[#0B0F19] border border-white/5 text-zinc-300 rounded px-2 py-1 outline-none text-[11px]"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="ORGANIZER">ORGANIZER</option>
                          <option value="ATTENDEE">ATTENDEE</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.license}
                          onChange={(e) => handleLicenseChange(u.id, e.target.value as any)}
                          className="bg-[#0B0F19] border border-white/5 text-zinc-300 rounded px-2 py-1 outline-none text-[11px]"
                        >
                          <option value="Basic">Basic Tier</option>
                          <option value="Pro">Pro Sync</option>
                          <option value="Enterprise">Enterprise Elite</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.id, e.target.value as any)}
                          className="bg-[#0B0F19] border border-white/5 text-zinc-300 rounded px-2 py-1 outline-none text-[11px]"
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. Security Audit Logs List */}
        <section className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-accent-purple" />
              Security Audit Activity History
            </h3>
          </div>

          <div className="bg-[#161D2F] border border-white/5 rounded-2xl shadow-lg p-5 max-h-80 overflow-y-auto space-y-3.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-start gap-4 p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-accent-purple uppercase tracking-wider">{log.action}</span>
                    <span className="text-[9px] text-zinc-600">IP: 192.168.1.108</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-zinc-500 block">{log.userName}</span>
                  <span className="text-[9px] text-zinc-600 block mt-0.5">
                    {new Date(log.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
