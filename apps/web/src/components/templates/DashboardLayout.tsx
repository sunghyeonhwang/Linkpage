import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Link2, Palette, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/cn';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드', end: true },
  { to: '/dashboard/links', icon: Link2, label: '링크' },
  { to: '/dashboard/appearance', icon: Palette, label: '디자인' },
  { to: '/dashboard/analytics', icon: BarChart3, label: '통계' },
  { to: '/dashboard/settings', icon: Settings, label: '설정' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <NavLink to="/dashboard" className="text-xl font-bold text-primary-600">
              LinkPage
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab nav */}
        <nav className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 overflow-x-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Main */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
