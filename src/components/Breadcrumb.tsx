import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-var(--text-tertiary)" strokeWidth={2} />
          )}

          {item.href ? (
            <Link
              to={item.href}
              className="text-var(--text-secondary) hover:text-var(--accent) transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-var(--text-primary) font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
