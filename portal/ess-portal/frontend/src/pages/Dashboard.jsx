import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CalendarDays, 
  Clock, 
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Attendance', value: '95%', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Leave Balance', value: '12 Days', icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tasks Pending', value: '4', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Performance', value: '4.8/5', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening today.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/30">
          Apply Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Q3 Townhall Meeting</h4>
                  <p className="text-gray-500 text-sm mt-1">Join us this Friday for the quarterly company update and AMA session.</p>
                  <span className="text-xs text-gray-400 mt-2 block">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Holidays</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Independence Day</p>
                <p className="text-sm text-gray-500">Aug 15, Thursday</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex flex-col items-center justify-center">
                <span className="text-xs text-green-600 font-bold">AUG</span>
                <span className="text-sm text-green-700 font-bold">15</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Diwali</p>
                <p className="text-sm text-gray-500">Oct 31, Thursday</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex flex-col items-center justify-center">
                <span className="text-xs text-orange-600 font-bold">OCT</span>
                <span className="text-sm text-orange-700 font-bold">31</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
