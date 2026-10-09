/**
 * RAVO OS — Áreas da empresa e suas telas.
 *
 * Fonte única para a tela de escolha de área, a sidebar, o menu mobile e o breadcrumb.
 * Para mover uma tela de área, basta trocar o item de grupo aqui.
 */

import { LayoutDashboard, Briefcase, Wallet, type LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  description: string;
}

export interface NavGroup {
  id: 'gestao' | 'comercial' | 'financeiro';
  label: string;
  description: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'gestao',
    label: 'Gestão',
    description: 'Visão geral do negócio e acompanhamento das metas.',
    icon: LayoutDashboard,
    items: [
      { path: '/dashboard', label: 'Dashboard', description: 'Visão geral do negócio' },
      { path: '/goals', label: 'Metas', description: 'Acompanhar KPIs e metas' },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    description: 'Leads, pipeline de vendas e carteira de clientes.',
    icon: Briefcase,
    items: [
      { path: '/crm', label: 'CRM', description: 'Leads e pipeline de vendas' },
      { path: '/cs', label: 'Customer Success', description: 'Tickets e satisfação dos clientes' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Receitas, despesas, DRE e métricas de receita recorrente.',
    icon: Wallet,
    items: [
      { path: '/finance', label: 'Financeiro', description: 'Receitas, despesas e fluxo de caixa' },
      { path: '/dre', label: 'DRE', description: 'Demonstração do resultado mensal' },
      { path: '/insights', label: 'Insights', description: 'MRR, ARR, churn, NRR, LTV e CAC' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Primeira tela de uma área (para onde o clique no cartão leva). */
export const groupHome = (g: NavGroup): string => g.items[0].path;

/** Grupo e item correspondentes a um caminho (ex.: '/dre/qualquer-coisa'). */
export function findNav(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => pathname.startsWith(i.path));
    if (item) return { group, item };
  }
  return undefined;
}
