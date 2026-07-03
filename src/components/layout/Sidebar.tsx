/**
 * RAVO OS — Sidebar Component
 * Componente Sidebar reutilizável
 */

import React, { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: ReactNode;
  items: NavItem[];
  footer?: ReactNode;
  collapsed?: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ logo, items, footer, collapsed = false, className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={`
          bg-gray-900 text-white transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 h-screen
          flex flex-col overflow-hidden
          ${className || ''}
        `}
        {...props}
      >
        {/* Logo */}
        <div className={`
          border-b border-gray-800 flex items-center justify-center
          ${collapsed ? 'h-20' : 'h-16 px-6'}
        `}>
          {logo || (
            <div className={`
              font-bold rounded-lg bg-blue-600 text-white
              ${collapsed ? 'w-10 h-10 flex items-center justify-center text-sm' : 'px-4 py-2'}
            `}>
              {collapsed ? 'R' : 'RAVO'}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors duration-200
                ${item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                {!collapsed && <span>{item.label}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-800 p-4">
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';
