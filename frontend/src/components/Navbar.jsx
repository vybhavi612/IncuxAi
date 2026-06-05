import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Clock, BookOpen, ShieldAlert, Settings, FileSpreadsheet } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/intern/dashboard'} className="flex items-center gap-2 group">
              <span className="bg-blue-600 p-2 rounded-lg text-white font-black tracking-wider text-lg shadow-md group-hover:bg-blue-700 transition">IS</span>
              <span className="font-extrabold text-xl tracking-tight hidden sm:block bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                InternSync
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {user.role === 'intern' ? (
              <>
                <Link to="/intern/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
                  Dashboard
                </Link>
                <Link to="/intern/attendance" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Attendance
                </Link>
                <Link to="/intern/projects" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Projects
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
                  Dashboard
                </Link>
                <Link to="/admin/attendance" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Attendance Live
                </Link>
                <Link to="/admin/projects" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Projects
                </Link>
                <Link to="/admin/analytics" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  Analytics
                </Link>
                <Link to="/admin/logs" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition">
                  <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                  Audit Logs
                </Link>
              </>
            )}
          </div>

          {/* User Profile Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-white leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {user.role} Account
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
                {user.profilePhotoURL ? (
                  <img src={user.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-danger/20 hover:text-danger hover:border-danger/30 border border-slate-700 py-2 px-3.5 rounded-xl font-semibold text-sm transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
