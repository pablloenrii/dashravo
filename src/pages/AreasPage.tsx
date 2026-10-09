/**
 * RAVO OS — Tela de escolha da área (primeira tela depois do login).
 * Gestão, Comercial ou Financeiro; cada cartão leva à primeira tela da área.
 */

import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { signOut, DEMO_MODE } from '@/services/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { NAV_GROUPS, groupHome } from '@/config/navigation';

export function AreasPage() {
  const { chart, text, surface } = useThemeTokens();

  return (
    <div style={{ minHeight: '100vh', background: surface.app, display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px', background: surface.elevated,
            border: `1px solid ${surface.borderStrong}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: text.white, fontWeight: 700, fontSize: '17px',
          }}>R</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: chart.light, lineHeight: 1.1 }}>RAVO</div>
            <div style={{ fontSize: '11px', color: text.dim, fontWeight: 500 }}>{DEMO_MODE ? 'DADOS DE EXEMPLO' : 'INTELLIGENCE'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            onClick={() => { signOut(); window.location.href = '/login'; }}
            title="Sair"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer',
              color: chart.light, background: surface.hover, border: `1px solid ${surface.borderStrong}`, borderRadius: '6px',
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Sair</span>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 64px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 650, color: text.primary, margin: 0, letterSpacing: '-0.01em', textAlign: 'center' }}>
          Escolha uma área
        </h1>
        <p style={{ fontSize: '14px', color: text.muted, margin: '8px 0 32px', textAlign: 'center' }}>
          Cada área mostra só as telas que importam para ela.
        </p>

        <div style={{
          width: '100%', maxWidth: '960px', display: 'grid', gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}>
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <Link
                key={group.id}
                to={groupHome(group)}
                aria-label={`Abrir ${group.label}`}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '14px',
                  textDecoration: 'none', background: surface.card, border: `1px solid ${surface.border}`,
                  transition: 'border-color 200ms, transform 200ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = chart.light; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = surface.border; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '11px', background: surface.elevated,
                  border: `1px solid ${surface.borderStrong}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: chart.light,
                }}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: '19px', fontWeight: 650, color: text.primary }}>{group.label}</div>
                <div style={{ fontSize: '13px', color: text.muted, lineHeight: 1.5 }}>{group.description}</div>
                <div style={{ fontSize: '12px', color: text.tertiary, marginTop: 'auto', paddingTop: '4px' }}>
                  {group.items.map((i) => i.label).join(' · ')}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default AreasPage;
