/**
 * RAVO OS — Seletor global de período
 * Controla o mês de referência de todas as telas via PeriodContext.
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { usePeriod, recentMonths, monthLabelLong, currentMonthKey } from '@/contexts/PeriodContext';

export function PeriodSelector({ compact = false }: { compact?: boolean }) {
  const { month, setMonth, label } = usePeriod();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const months = recentMonths(12).slice().reverse();
  const now = currentMonthKey();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: compact ? '7px 10px' : '8px 12px',
          background: '#0F0F0F',
          border: `1px solid ${open ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '8px', color: '#EDEDED',
          fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
          transition: 'border-color .15s ease', whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={14} style={{ color: '#8A8F98', flexShrink: 0 }} />
        {!compact && <span>{label}</span>}
        <ChevronDown size={13} style={{ color: '#8A8F98', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60,
            width: '210px', maxHeight: '340px', overflowY: 'auto',
            background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', padding: '6px',
          }}
        >
          <Option
            label="Todo o período"
            hint="acumulado"
            selected={month === null}
            onClick={() => { setMonth(null); setOpen(false); }}
          />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 4px' }} />
          {months.map((m) => (
            <Option
              key={m}
              label={monthLabelLong(m)}
              hint={m === now ? 'mês atual' : undefined}
              selected={month === m}
              onClick={() => { setMonth(m); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Option({ label, hint, selected, onClick }: {
  label: string; hint?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px', padding: '8px 10px', background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
        color: selected ? '#EDEDED' : '#9CA3AF', fontSize: '12.5px',
        fontWeight: selected ? 600 : 500,
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {hint && (
          <span style={{ fontSize: '10px', color: '#5B616E', flexShrink: 0 }}>{hint}</span>
        )}
      </span>
      {selected && <Check size={13} style={{ flexShrink: 0 }} />}
    </button>
  );
}
