import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { sb as supabase } from '@/services/supabase';
import { ToastContainer } from '@/components/ToastContainer';
import { CommandPalette } from '@/components/CommandPalette';
import { SearchBar } from '@/components/SearchBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenu } from '@/components/MobileMenu';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { PeriodSelector } from '@/components/PeriodSelector';
import { useNotifications } from '@/hooks/useNotifications';
import { chart, text, surface, semantic } from '@/constants/theme';

interface NavItem {
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/crm', label: 'CRM' },
  { path: '/cs', label: 'Customer Success' },
  { path: '/finance', label: 'Financeiro' },
  { path: '/goals', label: 'Metas' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { items: notifications, loading: notifLoading } = useNotifications();

  // Fecha o painel de notificações ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const currentLabel = navItems.find((i) => isActive(i.path))?.label ?? 'Dashboard';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <ToastContainer />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        isActive={isActive}
      />
      <div style={{ display: 'flex', height: '100vh', background: surface.app, overflow: 'hidden' }}>
        {/* Sidebar - Hidden on mobile */}
        <aside style={{
          width: sidebarOpen ? '16rem' : '5rem',
          background: surface.sidebar,
          borderRight: '0.5px solid rgba(255,255,255,0.04)',
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 40,
          transition: 'width 0.3s'
        }}>
          {/* Logo */}
          <div style={{ padding: '16px 12px', borderBottom: '0.5px solid rgba(255,255,255, 0.15)' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px',
                background: surface.elevated, border: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: text.white, fontWeight: 700, fontSize: '17px',
                boxShadow: '0 4px 16px rgba(255,255,255, 0.25)'
              }}>R</div>
              {sidebarOpen && (
                <div>
                  <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: chart.light }}>RAVO</h1>
                  <p style={{ margin: 0, fontSize: '11px', color: text.dim, fontWeight: '500' }}>INTELLIGENCE</p>
                </div>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive(item.path) ? chart.light : text.secondary,
                  background: isActive(item.path) ? surface.hover : 'rgba(255,255,255,0.02)',
                  borderLeft: isActive(item.path) ? `2.5px solid ${chart.light}` : '2.5px solid transparent',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '13px',
                  fontWeight: isActive(item.path) ? '600' : '500',
                  cursor: 'pointer'
                }}
              >
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                color: text.secondaryAlt,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {sidebarOpen ? '◄' : '►'}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: isMobile ? 0 : (sidebarOpen ? '16rem' : '5rem'),
          transition: 'margin 0.3s'
        }}>
          {/* Header */}
          <header style={{
            background: surface.sidebar,
            borderBottom: '0.5px solid rgba(255,255,255,0.04)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: isMobile ? '16px' : '32px',
            paddingRight: isMobile ? '16px' : '32px',
            gap: isMobile ? '12px' : '24px',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: text.secondary,
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = text.highlight}
                onMouseLeave={(e) => e.currentTarget.style.color = text.secondary}
              >
                <Menu size={20} />
              </button>
            )}
            {!isMobile && <Breadcrumb items={[{ label: currentLabel }]} />}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <PeriodSelector compact={isMobile} />
              {!isMobile && <SearchBar onSearchClick={() => setCommandOpen(true)} />}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="Notificações"
                  style={{ position: 'relative', padding: '8px 12px', color: text.secondary, background: surface.hover, border: '0.5px solid rgba(255,255,255, 0.15)', borderRadius: '6px', cursor: 'pointer', transition: 'all 300ms ease-out' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = chart.light; e.currentTarget.style.background = 'rgba(255,255,255, 0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = text.secondary; e.currentTarget.style.background = surface.hover; }}
                >
                  <Bell size={20} strokeWidth={1.5} />
                  {notifications.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '4px', right: '4px', width: '7px', height: '7px',
                      borderRadius: '50%', background: semantic.danger, border: `1.5px solid ${surface.sidebar}`,
                    }} />
                  )}
                </button>
                {notifOpen && (
                  <NotificationsPanel items={notifications} loading={notifLoading} onClose={() => setNotifOpen(false)} />
                )}
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.04)' }}></div>
              <ThemeToggle />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                title="Sair"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                  color: chart.light, background: 'rgba(255,255,255, 0.12)',
                  border: '0.5px solid rgba(255,255,255, 0.2)', borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 300ms ease-out'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: surface.elevated, border: '0.5px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: text.white, fontSize: '11px', fontWeight: 'bold'
                }}>P</div>
                <LogOut size={16} strokeWidth={2} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Sair</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: isMobile ? '16px' : '32px' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
