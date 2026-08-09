import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { text } from '@/constants/theme';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {index > 0 && <ChevronRight size={14} style={{ color: text.tertiary }} />}

          {item.href ? (
            <Link
              to={item.href}
              style={{ color: text.secondary, textDecoration: 'none', transition: 'color .15s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = text.secondary;
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: text.primary, fontWeight: 500 }}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
