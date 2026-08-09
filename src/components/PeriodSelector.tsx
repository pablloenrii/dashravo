/**
 * RAVO OS — Seletor global de período
 * Controla o mês de referência de todas as telas via PeriodContext.
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { usePeriod, recentMonths, monthLabelLong, currentMonthKey } from '@/contexts/PeriodContext';
import { text, surface } from '@/constants/theme';

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
          background: surface.card,
          border: `1px solid ${open ? 'rgba(255,255,255,0.18)' : surface.hover}`,
          borderRadius: '8px', color: text.strong,
          fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
          transition: 'border-color .15s ease', whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={14} style={{ color: text.muted, flexShrink: 0 }} />
        {!compact && <span>{label}</span>}
        <ChevronDown size={13} style={{ color: text.muted, flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60,
            width: '210px', maxHeight: '340px', overflowY: 'auto',
            background: surface.card, border: `1px solid ${surface.borderStrong}`,
            borderRadius: '10px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', padding: '6px',
          }}
        >
          <Option
            label="Todo o período"
            hint="acumulado"
            selected={month === null}
            onClick={() => { setMonth(null); setOpen(false); }}
          />
          <div style={{ height: '1px', background: surface.border, margin: '6px 4px' }} />
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
        gap: '8px', padding: '8px 10px', background: selected ? surface.hover : 'transparent',
        border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
        color: selected ? text.strong : text.secondary, fontSize: '12.5px',
        fontWeight: selected ? 600 : 500,
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = surface.input; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {hint && (
          <span style={{ fontSize: '10px', color: text.label, flexShrink: 0 }}>{hint}</span>
        )}
      </span>
      {selected && <Check size={13} style={{ flexShrink: 0 }} />}
    </button>
  );
}
