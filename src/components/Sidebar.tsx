"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Home,
  MessageSquare,
  Video,
  Database,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();

  const menuItems = [
    { name: "Home Dashboard", icon: Home, path: "/dashboard" },
    { name: "Team Messaging", icon: MessageSquare, path: "/chat" },
    { name: "Recordings Vault", icon: Database, path: "/recordings" },
  ];

  // Only show Admin Panel if user is ADMIN
  if (user?.role === "ADMIN") {
    menuItems.push({ name: "Admin Console", icon: ShieldCheck, path: "/admin" });
  }

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#111625] border-r border-white/5 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              VibeSync
            </h1>
            <span className="text-[10px] text-accent-blue font-semibold uppercase tracking-wider">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                  active
                    ? "bg-accent-blue text-white shadow-md shadow-accent-blue/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {user ? (
          <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-accent-purple" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-white truncate">{user.name}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 font-medium">
                {user.role}
              </span>
              <button
                onClick={logout}
                className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )}

        {/* Theme/Tools toggle */}
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>v1.2.0 (Stable)</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
