import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/crm', label: 'CRM', icon: '👥', badge: 0 },
  { path: '/finance', label: 'Finance', icon: '💰', badge: 0 },
  { path: '/goals', label: 'Goals', icon: '🎯', badge: 0 },
  { path: '/cs', label: 'Customer Success', icon: '⭐', badge: 0 },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-20'}
          bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700
          transition-all duration-300 flex flex-col shadow-sm
          fixed left-0 top-0 h-screen z-40
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              R
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">RAVO</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }
                ${!sidebarOpen && 'justify-center'}
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <span className="text-lg">{sidebarOpen ? '◄' : '►'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bem-vindo ao RAVO OS v2.0 — Central de Operações Estratégicas
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                👤
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
