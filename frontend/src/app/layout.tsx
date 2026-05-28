import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/auth-context';

export const metadata = {
  title: 'WorkPulse | Premium Telemetry & Performance Suite',
  description: 'Enterprise Online Attendance Tracking & Developer Productivity Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-900 text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
