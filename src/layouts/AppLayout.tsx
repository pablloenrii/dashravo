import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, LogOut, Menu } from 'lucide-react';
import { sb as supabase } from '@/services/supabase';
import { CommandPalette } from '@/components/CommandPalette';
import { SearchBar } from '@/components/SearchBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenu } from '@/components/MobileMenu';

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
  const location = useLocation();

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
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        isActive={isActive}
      />
      <div style={{ display: 'flex', height: '100vh', background: '#06070D', overflow: 'hidden' }}>
        {/* Sidebar - Hidden on mobile */}
        <aside style={{
          width: sidebarOpen ? '16rem' : '5rem',
          background: '#0B0E19',
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
          <div style={{ padding: '16px 12px', borderBottom: '0.5px solid rgba(58, 130, 246, 0.15)' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6200 0%, #CC4E00 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '22px',
                boxShadow: '0 4px 16px rgba(255, 98, 0, 0.25)'
              }}>R</div>
              {sidebarOpen && (
                <div>
                  <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#FF6200' }}>RAVO</h1>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>INTELLIGENCE</p>
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
                  color: isActive(item.path) ? '#FF6200' : '#9CA3AF',
                  background: isActive(item.path) ? 'rgba(255, 98, 0, 0.12)' : 'rgba(255,255,255,0.02)',
                  borderLeft: isActive(item.path) ? '2.5px solid #FF6200' : '2.5px solid transparent',
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
                color: '#94A3B8',
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
            background: '#0B0E19',
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
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#EBEBF0'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                <Menu size={20} />
              </button>
            )}
            {!isMobile && <Breadcrumb items={[{ label: 'Dashboard' }]} />}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <SearchBar onSearchClick={() => setCommandOpen(true)} />
              <button style={{ padding: '8px 12px', color: '#9CA3AF', background: 'rgba(255, 98, 0, 0.08)', border: '0.5px solid rgba(255, 98, 0, 0.15)', borderRadius: '6px', cursor: 'pointer', transition: 'all 300ms ease-out' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6200'; e.currentTarget.style.background = 'rgba(255, 98, 0, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'rgba(255, 98, 0, 0.08)'; }}>
                <Bell className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button style={{ padding: '8px 12px', color: '#9CA3AF', background: 'rgba(255, 98, 0, 0.08)', border: '0.5px solid rgba(255, 98, 0, 0.15)', borderRadius: '6px', cursor: 'pointer', transition: 'all 300ms ease-out' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6200'; e.currentTarget.style.background = 'rgba(255, 98, 0, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'rgba(255, 98, 0, 0.08)'; }}>
                <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
              </button>
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
                  color: '#FF6200', background: 'rgba(255, 98, 0, 0.12)',
                  border: '0.5px solid rgba(255, 98, 0, 0.2)', borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 300ms ease-out'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6200 0%, #CC4E00 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '11px', fontWeight: 'bold'
                }}>P</div>
                <LogOut className="w-4 h-4" strokeWidth={2} />
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
