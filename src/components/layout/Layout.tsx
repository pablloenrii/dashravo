/**
 * RAVO OS — Layout Component
 * Componente Layout wrapper
 */

import React, { ReactNode } from 'react';
import { Sidebar, type SidebarProps } from './Sidebar';
import { Header, type HeaderProps } from './Header';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: SidebarProps;
  header?: HeaderProps;
  children: ReactNode;
  footer?: ReactNode;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ sidebar, header, children, footer, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex flex-col h-screen bg-gray-50
          ${className || ''}
        `}
        {...props}
      >
        {/* Sidebar */}
        {sidebar && <Sidebar {...sidebar} />}

        {/* Main Content */}
        <div className={`flex flex-col flex-1 ${sidebar ? `ml-${sidebar.collapsed ? '[80px]' : '[256px]'}` : ''}`}>
          {/* Header */}
          {header && <Header {...header} />}

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          {footer && (
            <footer className="border-t border-gray-200 bg-white">
              {footer}
            </footer>
          )}
        </div>
      </div>
    );
  }
);

Layout.displayName = 'Layout';
