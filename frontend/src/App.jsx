import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Intern Pages
import InternDashboard from './pages/intern/InternDashboard';
import InternAttendance from './pages/intern/InternAttendance';
import InternProjects from './pages/intern/InternProjects';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveAttendance from './pages/admin/LiveAttendance';
import ReviewProjects from './pages/admin/ReviewProjects';
import AnalyticsHub from './pages/admin/AnalyticsHub';
import SystemAudit from './pages/admin/SystemAudit';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Intern Routes */}
          <Route
            path="/intern/dashboard"
            element={
              <ProtectedRoute allowedRoles={['intern']}>
                <InternDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern/attendance"
            element={
              <ProtectedRoute allowedRoles={['intern']}>
                <InternAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern/projects"
            element={
              <ProtectedRoute allowedRoles={['intern']}>
                <InternProjects />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LiveAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReviewProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemAudit />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
