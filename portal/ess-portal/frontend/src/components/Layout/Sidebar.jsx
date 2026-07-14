import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Receipt, 
  Target, 
  BookOpen, 
  LifeBuoy,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Employee', 'Manager', 'HR Executive', 'Payroll Officer', 'Department Head', 'System Administrator'] },
    { name: 'Attendance', path: '/attendance', icon: Clock, roles: ['Employee', 'Manager', 'HR Executive'] },
    { name: 'Leave Management', path: '/leave', icon: CalendarDays, roles: ['Employee', 'Manager', 'HR Executive'] },
    { name: 'Payroll & Payslips', path: '/payroll', icon: Receipt, roles: ['Employee', 'Payroll Officer'] },
    { name: 'Performance', path: '/performance', icon: Target, roles: ['Employee', 'Manager', 'Department Head'] },
    { name: 'Training', path: '/training', icon: BookOpen, roles: ['Employee', 'HR Executive'] },
    { name: 'Helpdesk', path: '/helpdesk', icon: LifeBuoy, roles: ['Employee', 'System Administrator', 'HR Executive'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['HR Executive', 'Manager', 'System Administrator'] },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xl leading-none">E</span>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">ESS Portal</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(user?.role || 'Employee'))
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
        ))}
      </nav>
    </aside>
  );
}
